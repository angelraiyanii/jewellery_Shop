const express = require("express");
const multer = require("multer");
const path = require("path");
const Product = require("../models/ProductModel");

const router = express.Router();

// Configure Multer for product image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/product_images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Add Product
router.post("/add-product", upload.single("productImage"), async (req, res) => {
  try {
    const {
      productName,
      categoryName,
      price,
      discount,
      goldWeight,
      diamondWeight,
      grossWeight,
      goldPrice,
      diamondPrice,
      makingCharges,
      overheadCharges,
      basePrice,
      tax,
      totalPrice,
      productType,
      productPurity,
      diamondColor,
      diamondPieces,
      stock,
      quantity,
    } = req.body;

    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    if (!productName || !categoryName || !price || !req.file) {
      return res.status(400).json({
        error: "Required fields (productName, categoryName, price, productImage) are missing",
        missingFields: { productName, categoryName, price, file: !!req.file },
      });
    }

    const newProduct = new Product({
      productName,
      categoryName,
      price,
      discount,
      goldWeight,
      diamondWeight,
      grossWeight,
      goldPrice,
      diamondPrice,
      makingCharges,
      overheadCharges,
      basePrice,
      tax,
      totalPrice,
      productType,
      productPurity,
      diamondColor,
      diamondPieces,
      stock,
      quantity,
      productImage: req.file.filename,
      status: "Active",
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    console.error("Error adding product:", error.stack);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});
// Get All Products
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Get Single Product by ID
router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update Product
router.put("/update-product/:id", upload.single("productImage"), async (req, res) => {
  try {
    const productId = req.params.id;
    const existingProduct = await Product.findById(productId);

    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Prepare updated fields from req.body
    const updatedFields = { ...req.body };

    // If a new image is uploaded, update the productImage field
    if (req.file) {
      updatedFields.productImage = req.file.filename;
    }

    // Update the product in the database
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updatedFields,
      { new: true }
    );

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete Product
router.delete("/delete-product/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//category
router.get("/ctproducts", async (req, res) => {
  try {
    const { categoryName } = req.query;
    let products;
    if (categoryName) {
      products = await Product.find({ categoryName }); // Filter by categoryName
    } else {
      products = await Product.find(); // Fetch all products
    }
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;