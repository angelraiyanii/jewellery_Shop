const express = require("express");
const router = express.Router();
const Offer = require("../models/OfferModel");
const multer = require("multer");
const path = require("path");
const fs = require('fs');

// Make sure upload directory exists
const uploadDir = path.join(__dirname, "../public/images/banner_images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "banner-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage: storage });

// Add Offer with file upload
router.post("/add", upload.single("banner"), async (req, res) => {
  try {
    console.log("Add request body:", req.body);
    
    const offerData = {
      ...req.body,
      discount: req.body.rate,
      validity: req.body.endDate
    };  if (req.file) {
      offerData.banner = req.file.filename;
    }
    
    const newOffer = new Offer(offerData);
    await newOffer.save();
    res.status(201).json({ success: true, message: "Offer added successfully" });
  } catch (err) {
    console.error("Add error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});
// Get All Offers
router.get("/", async (req, res) => {
  try {
    const offers = await Offer.find();
    res.json(offers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a route to get active offers for the banner
router.get("/active", async (req, res) => {
  try {
    const currentDate = new Date();
    const activeOffers = await Offer.find({
      status: "Active",
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    });
    
    console.log("Active offers found:", activeOffers.length); // For debugging
    res.json(activeOffers);
  } catch (err) {
    console.error("Error fetching active offers:", err);
    res.status(500).json({ message: err.message });
  }
});

// Verify Offer Code
router.post("/verify", async (req, res) => {
  try {
    const { offerCode, cartTotal } = req.body;
    
    if (!offerCode || !cartTotal) {
      return res.status(400).json({ 
        success: false, 
        message: "Offer code and cart total are required" 
      });
    }
    
    const currentDate = new Date();
    
    // Find matching offer by offer code (case-insensitive)
    const matchingOffer = await Offer.findOne({
      offerCode: offerCode.toUpperCase(),
      status: "Active",
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    });

    if (!matchingOffer) {
      return res.status(404).json({ 
        success: false, 
        message: "Invalid or expired offer code" 
      });
    }

    // Check minimum order requirement
    const minOrderTotal = parseFloat(matchingOffer.orderTotal);
    if (parseFloat(cartTotal) < minOrderTotal) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum order amount of ₹${minOrderTotal.toFixed(2)} required`,
        minOrderRequired: minOrderTotal
      });
    }

    const discountRate = parseFloat(matchingOffer.rate) / 100;
    let discountAmount = parseFloat(cartTotal) * discountRate;
    const maxDiscount = parseFloat(matchingOffer.maxdiscount);
    if (discountAmount > maxDiscount) {
      discountAmount = maxDiscount;
    }
    
    res.json({
      success: true,
      offer: matchingOffer,
      discountAmount: discountAmount.toFixed(2),
      appliedRate: `${matchingOffer.rate}%`,
      maxDiscount: maxDiscount
    });
  } catch (err) {
    console.error("Offer verification error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Offer with file upload
router.put("/update/:id", upload.single("banner"), async (req, res) => {
  try {
    console.log("Update request body:", req.body);
    
    const updateData = {
      ...req.body,
      discount: req.body.rate,
      validity: req.body.endDate
    };
    
    // Add banner filename if a file was uploaded
    if (req.file) {
      updateData.banner = req.file.filename;
    }
    
    const updatedOffer = await Offer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!updatedOffer) {
      return res.status(404).json({ 
        success: false, 
        message: "Offer not found" 
      });
    }
    
    res.json({ success: true, offer: updatedOffer });
  } catch (err) {
    console.error("Update error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete Offer
router.delete("/delete/:id", async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Offer deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;