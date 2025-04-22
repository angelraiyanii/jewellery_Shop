import React, { useState, useEffect } from "react";
import { FaStar, FaTrash } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../App.css";

const AdReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(4); // You can adjust this number
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    const adminData = localStorage.getItem("admin");
    const token = localStorage.getItem("admintoken");

    if (!adminData || !token) {
      setError("Please login as an admin to view this page");
      navigate("/login");
      setLoading(false);
      return;
    }

    const fetchReviews = async () => {
      setLoading(true);

      try {
        const response = await axios.get(
          "http://localhost:5000/api/ReviewModel/all",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Reviews fetched:", response.data); // Debug
        setReviews(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        const errorMsg =
          error.response?.data?.error || "Failed to load reviews.";
        setError(errorMsg);
        if (error.response?.status === 401) {
          setTimeout(() => navigate("/login"), 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [navigate]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const deleteReview = async (reviewId) => {
    const token = localStorage.getItem("admintoken");

    try {
      await axios.delete(
        `http://localhost:5000/api/ReviewModel/delete/${reviewId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReviews(reviews.filter((review) => review._id !== reviewId));
      setError(null);
    } catch (error) {
      console.error("Error deleting review:", error);
      setError(
        error.response?.data?.error ||
          "Failed to delete review. Please try again."
      );
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const userName = review.userId?.fullname || "";
    const productName = review.productId?.productName || "";
    const reviewText = review.review || "";
    const search = searchTerm.toLowerCase();
    return (
      userName.toLowerCase().includes(search) ||
      productName.toLowerCase().includes(search) ||
      reviewText.toLowerCase().includes(search)
    );
  });

  // Pagination logic
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = filteredReviews.slice(
    indexOfFirstReview,
    indexOfLastReview
  );
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">User Reviews</h2>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {loading ? (
        <p>Loading reviews...</p>
      ) : filteredReviews.length === 0 && !error ? (
        <p>No reviews found.</p>
      ) : (
        <>
          <div className="d-flex justify-content-end mb-3">
            <div className="d-flex">
              <input
                type="text"
                className="form-control me-2"
                placeholder="🔎Search reviews..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table table-bordered">
                <tr>
                  <th>Id</th>
                  <th>User</th>
                  <th>Product</th>
                  <th>Review</th>
                  <th>Rating</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentReviews.map((review, index) => (
                  <tr key={review._id}>
                    <td>{indexOfFirstReview + index + 1}</td>
                    <td>{review.userId?.fullname || "Unknown User"}</td>
                    <td>
                      {review.productId?.productName || "Unknown Product"}
                    </td>
                    <td>{review.review}</td>
                    <td>
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={
                            i < review.rating
                              ? "text-warning"
                              : "text-secondary"
                          }
                        />
                      ))}
                    </td>
                    <td>{new Date(review.date).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteReview(review._id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination start */}
          {filteredReviews.length > 0 && (
            <div className="row mt-3">
              <div className="col-md-12 d-flex justify-content-center">
                <nav>
                  <ul className="pagination">
                    <li
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        « Prev
                      </button>
                    </li>

                    {pageNumbers.map((number) => (
                      <li
                        key={number}
                        className={`page-item ${
                          currentPage === number ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(number)}
                        >
                          {number}
                        </button>
                      </li>
                    ))}

                    <li
                      className={`page-item ${
                        currentPage === totalPages ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next »
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          )}
          {/* Pagination end */}
        </>
      )}
    </div>
  );
};

export default AdReviews;
