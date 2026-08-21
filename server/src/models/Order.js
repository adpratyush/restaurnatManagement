const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },

    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
    },

    tableNumber: {
      type: Number,
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,

      validate: {
        validator: (items) => items.length > 0,
        message:
          "Order must contain at least one item",
      },
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    serviceCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    /*
     * ORDER STATUS
     *
     * pending
     * completed
     * cancelled
     */

 
    /*
     * PAYMENT STATUS
     *
     * Payment is NOT initiated by customer.
     *
     * Only admin can mark an order as paid.
     */

    paymentStatus: {
      type: String,

      enum: [
        "unpaid",
        "paid",
      ],

      default: "unpaid",
    },

    paymentMethod: {
      type: String,

      enum: [
        "cash",
      ],

      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      default: "",
    },
  },

  {
    timestamps: true,
  }
);

module.exports =
  mongoose.model("Order", orderSchema);