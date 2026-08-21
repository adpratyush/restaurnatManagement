const express = require("express");

const Table = require("../models/Table");
const Order = require("../models/Order");

const router = express.Router();


// =====================================================
// SYNC TABLE STATUS WITH ORDERS
// =====================================================
//
// A table is occupied only when it has an active unpaid
// order.
//
// A table becomes available when:
// - There are no active orders
// - All orders are paid
// - Orders were cancelled
//
// =====================================================

const syncTableStatuses = async () => {
  try {
    const tables = await Table.find({
      isActive: true,
    });

    for (const table of tables) {

      // Find active orders for this table
      const activeOrder = await Order.findOne({
        table: table._id,

        status: {
          $nin: [
            "cancelled",
            "completed",
          ],
        },

        paymentStatus: "unpaid",
      });

      // -----------------------------------------------
      // TABLE IS OCCUPIED
      // -----------------------------------------------

      if (activeOrder) {

        if (table.status !== "occupied") {

          table.status = "occupied";

          await table.save();
        }

      }

      // -----------------------------------------------
      // NO ACTIVE ORDER
      // -----------------------------------------------

      else {

        if (table.status !== "available") {

          table.status = "available";

          await table.save();
        }
      }
    }

  } catch (error) {

    console.error(
      "Table status synchronization error:",
      error.message
    );

  }
};


// =====================================================
// CREATE TABLE
// =====================================================

router.post("/", async (req, res) => {

  try {

    const {
      tableNumber,
      name,
      capacity,
    } = req.body;


    if (!tableNumber) {

      return res.status(400).json({
        success: false,
        message: "Table number is required",
      });

    }


    const existingTable =
      await Table.findOne({
        tableNumber,
      });


    if (existingTable) {

      return res.status(400).json({
        success: false,
        message: "Table already exists",
      });

    }


    const table =
      await Table.create({

        tableNumber,

        name,

        capacity,

      });


    res.status(201).json({

      success: true,

      message:
        "Table created successfully",

      data: table,

    });


  } catch (error) {

    console.error(
      "Create table error:",
      error
    );


    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

});


// =====================================================
// GET ALL TABLES
// =====================================================

router.get("/", async (req, res) => {

  try {

    // First synchronize database
    // table status with actual orders

    await syncTableStatuses();


    const tables =
      await Table.find()
        .sort({
          tableNumber: 1,
        });


    res.json({

      success: true,

      count: tables.length,

      data: tables,

    });


  } catch (error) {

    console.error(
      "Get tables error:",
      error
    );


    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

});


// =====================================================
// GET ONE TABLE
// =====================================================

router.get("/:id", async (req, res) => {

  try {

    // Synchronize first

    await syncTableStatuses();


    const table =
      await Table.findById(
        req.params.id
      );


    if (!table) {

      return res.status(404).json({

        success: false,

        message: "Table not found",

      });

    }


    res.json({

      success: true,

      data: table,

    });


  } catch (error) {

    console.error(
      "Get table error:",
      error
    );


    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

});


// =====================================================
// UPDATE TABLE
// =====================================================

router.put("/:id", async (req, res) => {

  try {

    const table =
      await Table.findByIdAndUpdate(

        req.params.id,

        req.body,

        {
          new: true,
          runValidators: true,
        }

      );


    if (!table) {

      return res.status(404).json({

        success: false,

        message: "Table not found",

      });

    }


    res.json({

      success: true,

      message:
        "Table updated successfully",

      data: table,

    });


  } catch (error) {

    console.error(
      "Update table error:",
      error
    );


    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

});


// =====================================================
// DELETE TABLE
// =====================================================

router.delete("/:id", async (req, res) => {

  try {

    const table =
      await Table.findByIdAndDelete(
        req.params.id
      );


    if (!table) {

      return res.status(404).json({

        success: false,

        message: "Table not found",

      });

    }


    res.json({

      success: true,

      message:
        "Table deleted successfully",

    });


  } catch (error) {

    console.error(
      "Delete table error:",
      error
    );


    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

});


module.exports = router;