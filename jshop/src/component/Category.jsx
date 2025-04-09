import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import "../App.css";
import c1 from "./Images/category1.png"; // Default image

const Category = ({ onCategorySelect }) => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/CategoryModel/categories"
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([
          {
            _id: "fallback1",
            categoryName: "Finger Ring",
            categoryImage: "category1.png",
          },
        ]);
      }
    };
    fetchCategories();
  }, []);

  // Handle category click
  const handleCategoryClick = (categoryName) => {
    if (onCategorySelect) {
      // If onCategorySelect prop exists, call it (for in-page filtering)
      onCategorySelect(categoryName);
    } else {
      // Otherwise redirect to Ct_product with category as query parameter
      navigate(`/Ct_product?category=${encodeURIComponent(categoryName)}`);
    }
  };

  return (
    <>
      <h3 className="p-3 text-center">Category Show</h3>
      <div className="category-container">
        {categories.length > 0 ? (
          categories.map((category) => (
            <div
              className="card-custom"
              key={category._id}
              onClick={() => handleCategoryClick(category.categoryName)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={
                  category.categoryImage
                    ? `http://localhost:5000/public/images/category_images/${category.categoryImage}`
                    : c1
                }
                className="card-image"
                alt={category.categoryName}
                onError={(e) => (e.target.src = c1)}
              />
              <div className="card-content">
                <h4 className="card-title">{category.categoryName}</h4>
                <p className="card-subtitle">
                  Show <span className="arrow">➤</span>
                </p>
              </div>
            </div>
          ))
        ) : (
          <div
            className="card-custom"
            onClick={() => handleCategoryClick("Finger Ring")}
            style={{ cursor: "pointer" }}
          >
            <img src={c1} className="card-image" alt="Default Category" />
            <div className="card-content">
              <h4 className="card-title">Finger Ring</h4>
              <p className="card-subtitle">
                Show <span className="arrow">➤</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Category;