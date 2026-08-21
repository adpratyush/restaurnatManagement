const express = require("express");

const Order = require("../models/Order");
const Table = require("../models/Table");

const router = express.Router();


// =====================================================
// MARK ORDER AS PAID
// =====================================================
//
// Customer does NOT initiate payment.
//
// Admin receives cash and clicks:
//
// "Mark as Paid"
//
// Then:
//
// paymentStatus = paid
// paymentMethod = cash
// paidAt = current time
// table = available (if no other unpaid order exists)
//
// =====================================================

router.patch("/:orderId/pay", async (req, res) => {
  try {

    const { orderId } = req.params;


    // -------------------------------------------------
    // FIND ORDER
    // -------------------------------------------------

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }


    // -------------------------------------------------
    // CHECK IF ALREADY PAID
    // -------------------------------------------------

    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Order is already paid",
      });
    }


    // -------------------------------------------------
    // RECORD CASH PAYMENT
    // -------------------------------------------------

    order.paymentStatus = "paid";

    order.paymentMethod = "cash";

    order.paidAt = new Date();

    await order.save();


    // -------------------------------------------------
    // CHECK FOR OTHER UNPAID ORDERS
    // ON THE SAME TABLE
    // -------------------------------------------------

    const unpaidOrders = await Order.find({

      table: order.table,

      paymentStatus: "unpaid",

      status: {
        $ne: "cancelled",
      },

      _id: {
        $ne: order._id,
      },

    });


    // -------------------------------------------------
    // FREE TABLE IF NO OTHER UNPAID ORDERS EXIST
    // -------------------------------------------------

    if (unpaidOrders.length === 0) {

      await Table.findByIdAndUpdate(
        order.table,
        {
          status: "available",
        }
      );

    }


    // -------------------------------------------------
    // GET UPDATED ORDER
    // -------------------------------------------------

    const updatedOrder =
      await Order.findById(order._id)
        .populate("table")
        .populate("items.menuItem");


    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    res.json({

      success: true,

      message:
        "Payment recorded successfully. Table is now available.",

      data: updatedOrder,

    });


  } catch (error) {

    console.error(
      "Payment error:",
      error
    );

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }
});


// =====================================================
// GET UNPAID ORDERS
// =====================================================

router.get("/unpaid", async (req, res) => {

  try {

    const orders =
      await Order.find({

        paymentStatus: "unpaid",

        status: {
          $ne: "cancelled",
        },

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
      "Get unpaid orders error:",
      error
    );

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

});


// =====================================================
// GET PAID ORDERS
// =====================================================

router.get("/paid", async (req, res) => {

  try {

    const orders =
      await Order.find({

        paymentStatus: "paid",

      })
        .populate("table")
        .populate("items.menuItem")
        .sort({
          paidAt: -1,
        });


    res.json({

      success: true,

      count: orders.length,

      data: orders,

    });


  } catch (error) {

    console.error(
      "Get paid orders error:",
      error
    );

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

});


module.exports = router;