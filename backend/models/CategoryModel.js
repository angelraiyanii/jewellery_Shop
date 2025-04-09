const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true, unique: true },
  categoryImage: { type: String, required: true }, 
  categoryStatus: { type: String, enum: ["Active", "Inactive"], required: true },
  createdAt: { type: Date, default: Date.now }
});
//demo Project 
module.exports = mongoose.model("Category", CategorySchema);
