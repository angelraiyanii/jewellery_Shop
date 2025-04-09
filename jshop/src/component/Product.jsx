import React, { Component } from "react";
import axios from "axios";
import pro1 from "./images/pro1.png"; // Default image
import { FaHeart } from "react-icons/fa"; // Heart Icon
import { FaInfoCircle } from "react-icons/fa"; // Info Icon
import { Link } from "react-router-dom";
import "../App.css";

export class Product extends Component {
  constructor() {
    super();
    this.state = {
      products: [], // Store fetched products
      liked: [], // Dynamically initialized based on products
      isLoading: false, // Loading state for add to cart
      isLikeLoading: false, // Loading state for like button
    };
  }

  // Fetch products when component mounts
  componentDidMount() {
    this.fetchProducts();
  }

  fetchProducts = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/ProductModel/products"
      );
      const products = response.data;

      // Initialize liked array
      const liked = Array(products.length).fill(false);

      // Check if user is logged in, fetch wishlist and update liked states
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

          // Update liked state based on wishlist
          products.forEach((product, index) => {
            if (wishlistProductIds.includes(product._id)) {
              liked[index] = true;
            }
          });
        } catch (error) {
          console.error("Error fetching wishlist:", error);
        }
      }

      this.setState({
        products,
        liked,
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      this.setState({
        products: [
          {
            _id: "fallback1",
            productName: "Gold Ring",
            price: 120,
            productImage: "pro1.png",
          },
        ],
        liked: [false],
      });
    }
  };

  // Add to cart functionality
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

  // Add to Wishlist - Fixed for class component
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

        // Update liked state in class component style
        const newLiked = [...liked];
        newLiked[index] = true;
        this.setState({ liked: newLiked });

        // Navigate to wishlist page
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

    return (
      <div className="container mt-3" style={{ paddingBottom: "60px" }}>
        <h2 className="text-center" style={{ paddingBottom: "20px" }}>
          Product List
        </h2>

        <div className="row p-3">
          {products.length > 0 ? (
            products.map((product, index) => (
              <div className="col-md-3" key={product._id}>
                <div className="card product-card text-center">
                  <img
                    src={
                      product.productImage
                        ? `http://localhost:5000/public/images/product_images/${product.productImage}`
                        : pro1 // Fallback to default image
                    }
                    alt={product.productName}
                    className="product-image"
                    onError={(e) => (e.target.src = pro1)} // Fallback if image fails
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
                    <p>${product.price}</p>
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
            ))
          ) : (
            // Fallback card if no products
            <div className="col-md-3">
              <div className="card product-card text-center">
                <img src={pro1} alt="Gold Ring" className="product-image" />
                <div className="overlay">
                  <FaHeart
                    className={`like-icon ${liked[0] ? "liked" : ""}`}
                    onClick={() =>
                      !isLikeLoading && this.toggleLike(0, "fallback1")
                    }
                    style={{ cursor: isLikeLoading ? "wait" : "pointer" }}
                  />
                  <Link to="/SinglePro">
                    <FaInfoCircle className="info-icon" />
                  </Link>
                  <h4>Gold Ring</h4>
                  <p>$120</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => this.addToCart("fallback1")}
                    disabled={isLoading}
                  >
                    {isLoading ? "Adding..." : "Add to Cart"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Product;
