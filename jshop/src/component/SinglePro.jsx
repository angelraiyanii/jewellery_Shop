import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Component } from "react";
import axios from "axios";
import pro1 from "./images/pro2.png";
import { useParams } from "react-router-dom";
import Rating_Review from "./Rating_Review";
import {
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
  FaTrash,
  FaEdit,
} from "react-icons/fa";

class SingleProClass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      product: null,
      error: null,
      isLoading: false,
      isLikeLoading: false,
      cartMessage: "",
      wishlistMessage: "",
      quantity: 1,
      averageRating: 0,
      reviewCount: 0,
      userReview: null,
      reviewForm: {
        rating: 0,
        review: "",
      },
      isEditingReview: false,
      reviewError: null,
      hasOrderedProduct: false, // New state to track if user ordered the product
    };
  }

  componentDidMount() {
    this.fetchProduct();
    this.fetchProductRating();
    this.fetchUserReview();
    this.checkUserOrder(); // Check if user ordered the product
  }

  componentDidUpdate(prevProps) {
    if (prevProps.productId !== this.props.productId) {
      this.fetchProduct();
      this.fetchProductRating();
      this.fetchUserReview();
      this.checkUserOrder();
    }
  }

  // New method to check if the user has ordered the product
  checkUserOrder = async () => {
    const { productId } = this.props;
    const userData = localStorage.getItem("user") || localStorage.getItem("admin");
  
    if (!userData) {
      this.setState({ hasOrderedProduct: false });
      return;
    }
  
    let user;
    try {
      user = JSON.parse(userData);
      const userId = user.id;
  
      // Use the existing endpoint
      const response = await axios.get(
        `http://localhost:5000/api/OrderModel/user/${userId}`
      );
  
      // Check if any order contains the productId in its items
      const hasOrdered = response.data.orders.some((order) =>
        order.items.some((item) => item.productId._id === productId)
      );
  
      this.setState({ hasOrderedProduct: hasOrdered });
    } catch (error) {
      console.error("Error checking user order:", error);
      this.setState({ hasOrderedProduct: false });
    }
  };

  fetchProduct = async () => {
    const { productId } = this.props;
    try {
      const response = await axios.get(
        `http://localhost:5000/api/ProductModel/products/${productId}`
      );
      this.setState({ product: response.data, loading: false });
    } catch (error) {
      console.error("Error fetching product:", error);
      this.setState({ error: "Failed to load product" });
    }
  };

  fetchProductRating = async () => {
    const { productId } = this.props;
    try {
      const response = await axios.get(
        `http://localhost:5000/api/ReviewModel/rating/${productId}`
      );
      this.setState({
        averageRating: response.data.averageRating,
        reviewCount: response.data.reviewCount,
      });
    } catch (error) {
      console.error("Error fetching product rating:", error);
      if (error.response?.status === 404) {
        this.setState({ averageRating: 0, reviewCount: 0 });
      }
    }
  };

  fetchUserReview = async () => {
    const { productId } = this.props;
    const userData =
      localStorage.getItem("user") || localStorage.getItem("admin");
    if (!userData) return;

    try {
      const user = JSON.parse(userData);
      const userId = user.id;
      const response = await axios.get(
        `http://localhost:5000/api/ReviewModel/product/${productId}`
      );
      const userReview = response.data.find(
        (review) => review.userId._id === userId
      );
      if (userReview) {
        this.setState({
          userReview,
          reviewForm: {
            rating: userReview.rating,
            review: userReview.review,
          },
          reviewError: null,
        });
      } else {
        this.setState({ reviewError: null });
      }
    } catch (error) {
      console.error("Error fetching user review:", error);
      if (error.response?.status === 404) {
        this.setState({ reviewError: null });
      } else {
        this.setState({
          reviewError: `Failed to fetch reviews: ${
            error.response?.data?.error || error.message
          }`,
        });
      }
    }
  };

  addToCart = async (productId) => {
    this.setState({ isLoading: true, cartMessage: "" });
    const userData =
      localStorage.getItem("user") || localStorage.getItem("admin");
    const token =
      localStorage.getItem("authToken") ||
      localStorage.getItem("usertoken") ||
      localStorage.getItem("admintoken");

    if (!userData || !token) {
      alert("Please log in to add to cart.");
      window.location.href = "/login";
      return;
    }

    let user;
    try {
      user = JSON.parse(userData);
    } catch (error) {
      console.error("Invalid user data in localStorage:", error);
      alert("Session invalid. Please log in again.");
      window.location.href = "/login";
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/CartModel/add",
        { userId: user.id, productId, quantity: this.state.quantity },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      this.setState({ cartMessage: "Product added to cart successfully!" });
      setTimeout(() => this.setState({ cartMessage: "" }), 3000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      if (error.response?.status === 401) {
        alert("Unauthorized: Invalid or expired session. Please log in again.");
        window.location.href = "/login";
      } else {
        alert(
          "Failed to add product to cart: " +
            (error.response?.data?.error || error.message)
        );
      }
    } finally {
      this.setState({ isLoading: false });
    }
  };

  addToWishlist = async (productId) => {
    this.setState({ isLikeLoading: true, wishlistMessage: "" });
    const userData =
      localStorage.getItem("user") || localStorage.getItem("admin");
    const token =
      localStorage.getItem("authToken") ||
      localStorage.getItem("usertoken") ||
      localStorage.getItem("admintoken");

    if (!userData || !token) {
      alert("Please log in to add to wishlist.");
      window.location.href = "/login";
      return;
    }

    let user;
    try {
      user = JSON.parse(userData);
    } catch (error) {
      console.error("Invalid user data in localStorage:", error);
      alert("Session invalid. Please log in again.");
      window.location.href = "/login";
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/WishlistModel/add",
        { userId: user.id, productId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      this.setState({
        wishlistMessage: "Product added to wishlist successfully!",
      });
      setTimeout(() => this.setState({ wishlistMessage: "" }), 3000);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      if (error.response?.status === 401) {
        alert("Unauthorized: Invalid or expired session. Please log in again.");
        window.location.href = "/login";
      } else {
        alert(
          "Failed to add product to wishlist: " +
            (error.response?.data?.error || error.message)
        );
      }
    } finally {
      this.setState({ isLikeLoading: false });
    }
  };

  handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      this.setState({ quantity: value });
    }
  };

  handleReviewChange = (e) => {
    const { name, value } = e.target;
    this.setState((prevState) => ({
      reviewForm: { ...prevState.reviewForm, [name]: value },
    }));
  };

  handleRatingChange = (rating) => {
    this.setState((prevState) => ({
      reviewForm: { ...prevState.reviewForm, rating },
    }));
  };

  submitReview = async () => {
    const { productId } = this.props;
    const { reviewForm } = this.state;
    const userData =
      localStorage.getItem("user") || localStorage.getItem("admin");
    const token =
      localStorage.getItem("authToken") ||
      localStorage.getItem("usertoken") ||
      localStorage.getItem("admintoken");

    if (!userData || !token) {
      alert("Please log in to submit a review.");
      window.location.href = "/login";
      return;
    }

    let user;
    try {
      user = JSON.parse(userData);
    } catch (error) {
      console.error("Invalid user data in localStorage:", error);
      alert("Session invalid. Please log in again.");
      window.location.href = "/login";
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/ReviewModel/add",
        {
          productId,
          rating: reviewForm.rating,
          review: reviewForm.review,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      this.setState({
        userReview: response.data.review,
        reviewForm: { rating: 0, review: "" },
        isEditingReview: false,
        reviewError: null,
      });
      this.fetchProductRating();
      this.fetchUserReview();
    } catch (error) {
      console.error("Error submitting review:", error);
      if (error.response?.status === 401) {
        alert("Unauthorized: Invalid or expired session. Please log in again.");
        window.location.href = "/login";
      } else {
        alert(
          "Failed to submit review: " +
            (error.response?.data?.error || error.message)
        );
      }
    }
  };

  deleteReview = async (reviewId) => {
    const userData =
      localStorage.getItem("user") || localStorage.getItem("admin");
    const token =
      localStorage.getItem("authToken") ||
      localStorage.getItem("usertoken") ||
      localStorage.getItem("admintoken");

    if (!userData || !token) {
      alert("Please log in to delete a review.");
      window.location.href = "/login";
      return;
    }

    let user;
    try {
      user = JSON.parse(userData);
    } catch (error) {
      console.error("Invalid user data in localStorage:", error);
      alert("Session invalid. Please log in again.");
      window.location.href = "/login";
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/ReviewModel/delete/${reviewId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      this.setState({
        userReview: null,
        reviewForm: { rating: 0, review: "" },
        reviewError: null,
      });
      this.fetchProductRating();
      this.fetchUserReview();
    } catch (error) {
      console.error("Error deleting review:", error);
      if (error.response?.status === 401) {
        alert("Unauthorized: Invalid or expired session. Please log in again.");
        window.location.href = "/login";
      } else {
        alert(
          "Failed to delete review: " +
            (error.response?.data?.error || error.message)
        );
      }
    }
  };

  startEditingReview = () => {
    this.setState({ isEditingReview: true });
  };

  renderStars = (value) => {
    const stars = [];
    const fullStars = Math.floor(value);
    const hasHalfStar = value - fullStars >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FaStar key={`star-${i}`} className="star-icon text-warning" />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <FaStarHalfAlt key="half-star" className="star-icon text-warning" />
      );
    }
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <FaRegStar key={`empty-${i}`} className="star-icon text-warning" />
      );
    }
    return stars;
  };

  render() {
    const {
      product,
      error,
      isLoading,
      isLikeLoading,
      cartMessage,
      wishlistMessage,
      quantity,
      averageRating,
      reviewCount,
      userReview,
      reviewForm,
      isEditingReview,
      reviewError,
      hasOrderedProduct,
    } = this.state;
    const { productId } = this.props;

    if (error) {
      return <div className="container mt-5 text-danger">{error}</div>;
    }

    const defaultProduct = {
      productName: "ProductName",
      categoryName: "Categoryname",
      price: 567,
      discount: 34,
      goldWeight: "0.06 Gram",
      diamondWeight: "0.09 Gram",
      grossWeight: "0.40 Gram",
      goldPrice: 1234.9,
      diamondPrice: 0,
      makingCharges: 130,
      overheadCharges: 500,
      basePrice: 2345.09,
      tax: 78.04,
      totalPrice: 23343.89,
      productType: "Rose Gold",
      productPurity: "20K",
      diamondColor: "NA",
      diamondPieces: 120.78,
      stock: 2,
      productImage: null,
    };

    const displayProduct = product || defaultProduct;
    const isLoggedIn = !!(
      localStorage.getItem("user") || localStorage.getItem("admin")
    );

    return (
      <>
        <div className="container mt-5">
          <div className="row align-items shadow p-3 rounded">
            <div className="col-md-4 text-center">
              <img
                src={
                  displayProduct.productImage
                    ? `http://localhost:5000/public/images/product_images/${displayProduct.productImage}`
                    : pro1
                }
                alt={displayProduct.productName}
                className="img-fluid rounded"
                style={{ height: "200px", objectFit: "cover" }}
                onError={(e) => (e.target.src = pro1)}
              />
              {reviewCount > 0 && (
                <div className="mt-3">
                  <div className="d-flex justify-content-center align-items-center">
                    <div className="stars">
                      {this.renderStars(averageRating)}
                    </div>
                    <span className="ms-2">({reviewCount} reviews)</span>
                  </div>
                </div>
              )}
            </div>
            <div className="col-md-8">
              <div className="mt-5">
                <div className="product-details text-start">
                  <h3>{displayProduct.productName}</h3>
                  <p className="text-muted">{displayProduct.categoryName}</p>
                  <div className="d-flex align-items-center">
                    <h5 className="text-decoration-line-through me-2 text-gray-400">
                      Rs.{" "}
                      {(
                        displayProduct.price /
                        (1 - displayProduct.discount / 100)
                      ).toFixed(2)}
                    </h5>
                    <h5 className="text-danger me-2">
                      Rs. {displayProduct.price}
                    </h5>
                    <span
                      className="border-start mx-2"
                      style={{ height: "1.5rem", borderColor: "#495057" }}
                    />
                    <h6 style={{ color: "green" }}>
                      {displayProduct.discount}% off
                    </h6>
                  </div>
                  <div className="mt-4">
                    <h6
                      className="fw-bold"
                      style={{ fontSize: "12px", color: "#41566E" }}
                    >
                      Weight Details
                    </h6>
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Gold weight</th>
                            <th>Diamond weight</th>
                            <th>Gross weight</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{displayProduct.goldWeight}</td>
                            <td>{displayProduct.diamondWeight}</td>
                            <td>{displayProduct.grossWeight}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h6
                      className="fw-bold"
                      style={{ fontSize: "12px", color: "#41566E" }}
                    >
                      Price Details
                    </h6>
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Gold price</th>
                            <th>Diamond price</th>
                            <th>Making charges</th>
                            <th>Overhead charges</th>
                            <th>Base price</th>
                            <th>Tax</th>
                            <th>Total price</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>₹ {displayProduct.goldPrice.toFixed(2)}</td>
                            <td>₹ {displayProduct.diamondPrice.toFixed(2)}</td>
                            <td>₹ {displayProduct.makingCharges.toFixed(2)}</td>
                            <td>
                              ₹ {displayProduct.overheadCharges.toFixed(2)}
                            </td>
                            <td>₹ {displayProduct.basePrice.toFixed(2)}</td>
                            <td>₹ {displayProduct.tax.toFixed(2)}</td>
                            <td>₹ {displayProduct.totalPrice.toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </table>
                      <ul style={{ fontSize: "12px" }}>
                        <li>Product type: {displayProduct.productType}</li>
                        <li>Product purity: {displayProduct.productPurity}</li>
                        <li>Diamond color: {displayProduct.diamondColor}</li>
                        <li>Diamond pieces: {displayProduct.diamondPieces}</li>
                        <li>Stock: {displayProduct.stock}</li>
                      </ul>
                    </div>
                  </div>
                  <div className="product-options mt-4">
                    <div className="form-group">
                      <label
                        htmlFor="quantity"
                        className="fw-bold"
                        style={{ fontSize: "12px", color: "#41566E" }}
                      >
                        Quantity:
                      </label>
                      <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        className="form-control w-25"
                        value={quantity}
                        onChange={this.handleQuantityChange}
                        min="1"
                        max={displayProduct.stock}
                      />
                    </div>
                    <input
                      type="hidden"
                      name="P_Code"
                      value={displayProduct._id || "ABC123"}
                    />
                    <input
                      type="hidden"
                      name="p_tot_price"
                      value={displayProduct.totalPrice}
                    />
                    <div className="form-group mt-3">
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => this.addToCart(displayProduct._id)}
                        disabled={isLoading || displayProduct.stock < 1}
                      >
                        {isLoading ? "Adding..." : "Add to Cart"}
                      </button>
                      <button
                        className="btn btn-outline-primary ms-2"
                        onClick={() => this.addToWishlist(displayProduct._id)}
                        disabled={isLikeLoading}
                      >
                        {isLikeLoading ? "Adding..." : "Add to Wishlist"}
                      </button>
                    </div>
                    {cartMessage && (
                      <div className="alert alert-success mt-3" role="alert">
                        {cartMessage}
                      </div>
                    )}
                    {wishlistMessage && (
                      <div className="alert alert-success mt-3" role="alert">
                        {wishlistMessage}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Review Submission Form - Conditional Rendering */}
          {isLoggedIn && hasOrderedProduct ? (
            <div className="mt-5">
              <h4>
                {userReview && !isEditingReview
                  ? "Your Review"
                  : "Submit a Review"}
              </h4>
              {reviewError && (
                <div className="alert alert-danger" role="alert">
                  {reviewError}
                </div>
              )}
              {userReview && !isEditingReview ? (
                <div className="border p-3 rounded">
                  <div className="d-flex align-items-center">
                    <div className="stars">
                      {this.renderStars(userReview.rating)}
                    </div>
                    <span className="ms-2">{userReview.rating}/5</span>
                  </div>
                  <p className="mt-2">{userReview.review}</p>
                  <div>
                    <button
                      className="btn btn-primary btn-sm me-2"
                      onClick={this.startEditingReview}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => this.deleteReview(userReview._id)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border p-3 rounded">
                  <div className="mb-3">
                    <label className="form-label">Rating:</label>
                    <div className="d-flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`star-icon me-1 ${
                            reviewForm.rating >= star
                              ? "text-warning"
                              : "text-secondary"
                          }`}
                          style={{ cursor: "pointer" }}
                          onClick={() => this.handleRatingChange(star)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="reviewText" className="form-label">
                      Review:
                    </label>
                    <textarea
                      id="reviewText"
                      name="review"
                      className="form-control"
                      value={reviewForm.review}
                      onChange={this.handleReviewChange}
                      rows="4"
                      placeholder="Write your review here..."
                    />
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={this.submitReview}
                    disabled={!reviewForm.rating || !reviewForm.review}
                  >
                    {isEditingReview ? "Update Review" : "Submit Review"}
                  </button>
                </div>
              )}
            </div>
          ) : isLoggedIn ? (
            <div className="mt-5">
              <p className="text-muted">
                You need to purchase this product to submit a review.
              </p>
            </div>
          ) : (
            <div className="mt-5">
              <p className="text-muted">
                Please log in to submit a review for this product.
              </p>
            </div>
          )}
        </div>
        <Rating_Review productId={productId} />
      </>
    );
  }
}

const SinglePro = () => {
  const { productId } = useParams();
  return <SingleProClass productId={productId} />;
};

export default SinglePro;
