const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
    },

    name: {
      type: String,
      default: "",
      trim: true,
    },

    capacity: {
      type: Number,
      default: 4,
      min: 1,
    },

    status: {
      type: String,
      enum: ["available", "occupied"],
      default: "available",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Table", tableSchema);