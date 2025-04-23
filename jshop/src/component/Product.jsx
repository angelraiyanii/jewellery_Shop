import React, { Component } from "react";
import axios from "axios";
import pro1 from "./images/pro1.png";
import { FaHeart } from "react-icons/fa";
import { FaInfoCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../App.css";

export class Product extends Component {
  constructor() {
    super();
    this.state = {
      products: [],
      categories: [],
      liked: [],
      isLoading: false,
      isLikeLoading: false,
      showAll: false, // New state to control how many products to show
    };
  }

  componentDidMount() {
    this.fetchCategoriesAndProducts();
  }

  fetchCategoriesAndProducts = async () => {
    try {
      // Fetch categories first
      const categoriesResponse = await axios.get(
        "http://localhost:5000/api/CategoryModel/categories"
      );
      const categories = categoriesResponse.data;

      // Then fetch products
      const productsResponse = await axios.get(
        "http://localhost:5000/api/ProductModel/products"
      );
      const allProducts = productsResponse.data;

      const activeCategoryNames = categories
        .filter((category) => category.categoryStatus === "Active")
        .map((category) => category.categoryName);

      const filteredProducts = allProducts.filter((product) =>
        activeCategoryNames.includes(product.categoryName)
      );

      const liked = Array(filteredProducts.length).fill(false);

      const userData =
        localStorage.getItem("user") || localStorage.getItem("admin");
      if (userData) {
        const user = JSON.parse(userData);
        const userId = user.id;

        try {
          const wishlistResponse = await axios.get(
            `http://localhost:5000/api/WishlistModel/${userId}`
          );
          const wishlistProductIds = wishlistResponse.data.map(
            (item) => item.productId._id
          );
          filteredProducts.forEach((product, index) => {
            if (wishlistProductIds.includes(product._id)) {
              liked[index] = true;
            }
          });
        } catch (error) {
          console.error("Error fetching wishlist:", error);
        }
      }

      this.setState({
        products:
          filteredProducts.length > 0
            ? filteredProducts
            : [
                {
                  _id: "fallback1",
                  productName: "Gold Ring",
                  price: 120,
                  productImage: "pro1.png",
                  categoryName: "Finger Ring",
                },
              ],
        categories,
        liked,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      this.setState({
        products: [
          {
            _id: "fallback1",
            productName: "Gold Ring",
            price: 120,
            productImage: "pro1.png",
            categoryName: "Finger Ring",
          },
        ],
        liked: [false],
      });
    }
  };

  addToCart = async (productId) => {
    this.setState({ isLoading: true });

    try {
      const userData =
        localStorage.getItem("user") || localStorage.getItem("admin");

      if (!userData) {
        window.location.href = "/login";
        return;
      }
      const user = JSON.parse(userData);
      const userId = user.id;

      console.log(
        "Adding to cart with userId:",
        userId,
        "productId:",
        productId
      );

      const response = await axios.post(
        "http://localhost:5000/api/CartModel/add",
        {
          userId,
          productId,
        }
      );

      console.log("Added to cart response:", response.data);
      window.location.href = "/cart";
    } catch (error) {
      console.error(
        "Error adding to cart:",
        error.response?.data || error.message
      );
      alert(
        "Failed to add product to cart: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      this.setState({ isLoading: false });
    }
  };

  toggleLike = async (index, productId) => {
    const userData =
      localStorage.getItem("user") || localStorage.getItem("admin");

    if (!userData) {
      window.location.href = "/login";
      return;
    }

    const user = JSON.parse(userData);
    const userId = user.id;

    this.setState({ isLikeLoading: true });

    try {
      const { liked } = this.state;

      if (!liked[index]) {
        await axios.post("http://localhost:5000/api/WishlistModel/add", {
          userId,
          productId,
        });
        const newLiked = [...liked];
        newLiked[index] = true;
        this.setState({ liked: newLiked });
        window.location.href = "/wishlist";
      } else {
        alert("Item already in wishlist");
      }
    } catch (error) {
      console.error(
        "Error updating wishlist:",
        error.response?.data || error.message
      );
      alert(
        "Failed to update wishlist: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      this.setState({ isLikeLoading: false });
    }
  };

  render() {
    const { products, liked, isLoading, isLikeLoading } = this.state;
    // Show only 8 products (2 rows of 4) initially
    const displayedProducts = this.state.showAll
      ? products
      : products.slice(0, 8);

    return (
      <div className="container mt-3" style={{ paddingBottom: "60px" }}>
        <h2 className="text-center" style={{ paddingBottom: "20px" }}>
          Available Products
        </h2>

        {displayedProducts.length === 0 ? (
          <div className="text-center">
            <p>No active products available at the moment.</p>
          </div>
        ) : (
          <>
            <div className="row row-cols-1 row-cols-md-4 g-4">
              {displayedProducts.map((product, index) => (
                <div className="col" key={product._id}>
                  <div className="card product-card text-center h-100">
                    <img
                      src={
                        product.productImage
                          ? `http://localhost:5000/public/images/product_images/${product.productImage}`
                          : pro1
                      }
                      alt={product.productName}
                      className="product-image"
                      onError={(e) => (e.target.src = pro1)}
                    />
                    <div className="overlay">
                      <FaHeart
                        className={`like-icon ${liked[index] ? "liked" : ""}`}
                        onClick={() =>
                          !isLikeLoading && this.toggleLike(index, product._id)
                        }
                        style={{ cursor: isLikeLoading ? "wait" : "pointer" }}
                      />
                      <Link to={`/SinglePro/${product._id}`}>
                        <FaInfoCircle className="info-icon" />
                      </Link>
                      <h4>{product.productName}</h4>
                      <p>₹{product.price}</p>
                      <button
                        className="btn btn-primary"
                        onClick={() => this.addToCart(product._id)}
                        disabled={isLoading}
                      >
                        {isLoading ? "Adding..." : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Show "View More" button if there are more products to show */}
            {!this.state.showAll && products.length > 8 && (
              <div className="text-center mt-4">
                <Link to="/Ct_Product" className="btn btn-outline-primary">
                  View More Products
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    );
  }
}

export default Product;
