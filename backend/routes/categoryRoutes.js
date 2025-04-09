const express = require("express");
const multer = require("multer");
const path = require("path");
const Category = require("../models/CategoryModel");

const router = express.Router();

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/category_images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Add Category
router.post("/add-category", upload.single("categoryImage"), async (req, res) => {
  try {
    const { categoryName, categoryStatus } = req.body;

    // Validation
    if (!categoryName || !req.file || !categoryStatus) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newCategory = new Category({
      categoryName,
      categoryImage: req.file.filename,
      categoryStatus,
    });

    await newCategory.save();

    res.status(201).json({ message: "Category added successfully", category: newCategory });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get All Categories
router.get("/categories", async (req, res) => {
  console.log("Fetching categories...");
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update Category
router.put("/update-category/:id", upload.single("categoryImage"), async (req, res) => {
  try {
    const { categoryName, categoryStatus } = req.body;
    const updateData = { categoryName, categoryStatus };

    if (req.file) {
      updateData.categoryImage = req.file.filename;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json({ message: "Category updated successfully", category: updatedCategory });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete Category
router.delete("/delete-category/:id", async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);

    if (!deletedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;