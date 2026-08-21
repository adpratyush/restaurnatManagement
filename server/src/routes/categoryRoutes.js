const express = require("express");
const Category = require("../models/Category");

const router = express.Router();

// Create category
router.post("/", async (req, res) => {
  try {
    const { name, description, image, sortOrder } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const existingCategory = await Category.findOne({ name });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name,
      description,
      image,
      sortOrder,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({
      isActive: true,
    }).sort({
      sortOrder: 1,
      name: 1,
    });

    res.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;