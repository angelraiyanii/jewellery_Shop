const express = require("express");
const router = express.Router();

// Importing route files
// User 
const loginRoutes = require("./loginRoutes");
router.use("/Login", loginRoutes);

//category
const categoryRoutes = require("./categoryRoutes");
router.use("/CategoryModel", categoryRoutes);

//Product
const productRoutes = require("./productRoutes");
router.use("/ProductModel", productRoutes);

//Banner
const bannerRoutes = require("./bannerRoutes");
router.use("/BannerModel", bannerRoutes);

//aboutUs
const aboutRoutes = require("./aboutRoutes");
router.use("/AboutModel", aboutRoutes);

//offer
const offerRoutes = require("./offerRoutes");
router.use("/OfferModel", offerRoutes);

// Contact 
const contactRoutes = require("./contactRoutes"); 
router.use("/ContactModel", contactRoutes);

// Cart 
const cartRoutes = require("./cartRoutes"); 
router.use("/CartModel", cartRoutes);

// Wishlist 
const wishlistRoutes = require("./wishlistRoutes"); 
router.use("/WishlistModel", wishlistRoutes);

router.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

module.exports = router;