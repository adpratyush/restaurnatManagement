const express = require("express");

const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const Table = require("../models/Table");

const router = express.Router();


// =====================================================
// GENERATE ORDER NUMBER
// =====================================================

const generateOrderNumber = () => {
  return `ORD-${Date.now()}`;
};


// =====================================================
// CREATE ORDER
// =====================================================

router.post("/", async (req, res) => {
  try {
    const {
      tableId,
      items,
      notes,
    } = req.body;

    // Validate request
    if (
      !tableId ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Table and order items are required",
      });
    }


    // Find table
    const table = await Table.findById(tableId);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }


    // Get menu items
    const menuItemIds = items.map(
      (item) => item.menuItem
    );

    const menuItems = await MenuItem.find({
      _id: {
        $in: menuItemIds,
      },
      isAvailable: true,
    });


    // Make sure every requested item exists
    if (menuItems.length !== menuItemIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more menu items are unavailable",
      });
    }


    // Build order items
    let subtotal = 0;

    const orderItems = items.map((item) => {
      const menuItem = menuItems.find(
        (menu) =>
          menu._id.toString() ===
          item.menuItem.toString()
      );


      if (!menuItem) {
        throw new Error(
          `Menu item not found: ${item.menuItem}`
        );
      }


      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error("Invalid item quantity");
      }


      const itemTotal =
        menuItem.price * quantity;

      subtotal += itemTotal;


      return {
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        total: itemTotal,
      };
    });


    // Tax and service charge
    const tax = 0;
    const serviceCharge = 0;

    const total =
      subtotal +
      tax +
      serviceCharge;


    // Create order
    const order = await Order.create({
      orderNumber: generateOrderNumber(),

      table: table._id,

      tableNumber:
        table.tableNumber,

      items: orderItems,

      subtotal,

      tax,

      serviceCharge,

      total,

      status: "pending",

      paymentStatus: "unpaid",

      paymentMethod: null,

      paidAt: null,

      notes: notes || "",
    });


    // Mark table occupied
    table.status = "occupied";

    await table.save();


    // Populate order
    const populatedOrder =
      await Order.findById(order._id)
        .populate("table")
        .populate("items.menuItem");


    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: populatedOrder,
    });


  } catch (error) {

    console.error(
      "Create order error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// =====================================================
// GET ALL ORDERS
// =====================================================

router.get("/", async (req, res) => {
  try {

    const orders =
      await Order.find()
        .populate("table")
        .populate("items.menuItem")
        .sort({
          createdAt: -1,
        });


    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });


  } catch (error) {

    console.error(
      "Get orders error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// =====================================================
// GET ACTIVE ORDERS
// =====================================================

router.get("/active", async (req, res) => {
  try {

    const orders =
      await Order.find({
        status: "pending",
      })
        .populate("table")
        .populate("items.menuItem")
        .sort({
          createdAt: -1,
        });


    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });


  } catch (error) {

    console.error(
      "Get active orders error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// =====================================================
// GET ORDERS FOR A TABLE
// =====================================================

router.get(
  "/table/:tableId",
  async (req, res) => {
    try {

      const orders =
        await Order.find({
          table: req.params.tableId,

          status: {
            $ne: "cancelled",
          },
        })
          .populate("items.menuItem")
          .sort({
            createdAt: -1,
          });


      res.json({
        success: true,
        count: orders.length,
        data: orders,
      });


    } catch (error) {

      console.error(
        "Get table orders error:",
        error
      );

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);


// =====================================================
// GET SINGLE ORDER
// =====================================================

router.get("/:id", async (req, res) => {
  try {

    const order =
      await Order.findById(
        req.params.id
      )
        .populate("table")
        .populate("items.menuItem");


    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }


    res.json({
      success: true,
      data: order,
    });


  } catch (error) {

    console.error(
      "Get order error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// =====================================================
// UPDATE ORDER STATUS
// =====================================================
//
// Only:
//
// pending
// completed
// cancelled
//
// IMPORTANT:
// Completing an order DOES NOT free the table.
// The table is freed only after payment.
// =====================================================

router.patch(
  "/:id/status",
  async (req, res) => {
    try {

      const {
        status,
      } = req.body;


      const allowedStatuses = [
        "pending",
        "completed",
        "cancelled",
      ];


      if (
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status",
        });
      }


      const order =
        await Order.findById(
          req.params.id
        );


      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }


      // -------------------------------------------------
      // DO NOT ALLOW STATUS CHANGES AFTER PAYMENT
      // -------------------------------------------------

      if (
        order.paymentStatus === "paid" &&
        status !== "completed"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A paid order cannot be changed to this status",
        });
      }


      order.status = status;

      await order.save();


      const updatedOrder =
        await Order.findById(
          order._id
        )
          .populate("table")
          .populate("items.menuItem");


      res.json({
        success: true,
        message: "Order status updated",
        data: updatedOrder,
      });


    } catch (error) {

      console.error(
        "Update order status error:",
        error
      );

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);


module.exports = router;