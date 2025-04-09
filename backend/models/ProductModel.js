const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  categoryName: { type: String, required: true }, 
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  goldWeight: { type: Number, required: true },
  diamondWeight: { type: Number, required: true },
  grossWeight: { type: Number, required: true },
  goldPrice: { type: Number, required: true },
  diamondPrice: { type: Number, required: true },
  makingCharges: { type: Number, required: true },
  overheadCharges: { type: Number, required: true },
  basePrice: { type: Number, required: true },
  tax: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  productType: { type: String, required: true },
  productPurity: { type: String, required: true },
  diamondColor: { type: String, required: true },
  diamondPieces: { type: Number, required: true },
  stock: { type: Number, required: true },
  quantity: { type: Number, required: true },
  productImage: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Product", ProductSchema);
