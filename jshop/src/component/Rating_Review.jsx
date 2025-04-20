import React, { useState, useEffect } from "react";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import axios from "axios";
import u1 from "./Images/user_photo.png";

const Rating_Review = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [userImages, setUserImages] = useState({});
  const [loadingImages, setLoadingImages] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/ReviewModel/product/${productId}`
        );
        setReviews(response.data);
        setError(null);

        // Fetch user images only if there are reviews
        if (response.data.length > 0) {
          await fetchUserImages(response.data);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setError(error.response?.data?.error || "Failed to load reviews");
      }
    };

    const fetchUserImages = async (reviewsData) => {
      setLoadingImages(true);
      try {
        const images = {};

        await Promise.all(
          reviewsData.map(async (review) => {
            try {
              const userResponse = await axios.get(
                `http://localhost:5000/api/Login/user/${review.userId._id}`
              );
              if (userResponse.data?.profilePic) {
                images[
                  review.userId._id
                ] = `http://localhost:5000/public/images/profile_pictures/${userResponse.data.profilePic}`;
              }
            } catch (userError) {
              console.error(
                `Error fetching user ${review.userId._id}:`,
                userError
              );
              images[review.userId._id] = u1;
            }
          })
        );

        setUserImages(images);
      } catch (error) {
        console.error("Error in user images fetch:", error);
      } finally {
        setLoadingImages(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

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

  return (
    <div className="container my-5">
      <h2>Customer Reviews</h2>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {loadingImages && <p>Loading user images...</p>}
      {reviews.length === 0 && !error ? (
        <p>No reviews yet for this product.</p>
      ) : (
        <div
          className="review-container"
          style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}
        >
          {reviews.map((review) => (
            <div
              key={review._id}
              className="review-card border p-3 rounded"
              style={{ width: "300px" }}
            >
              <img
                src={userImages[review.userId._id] || u1}
                alt="User"
                className="rounded-circle mb-2"
                style={{ width: "50px", height: "50px", objectFit: "cover" }}
                onError={(e) => {
                  e.target.src = u1;
                }}
              />
              <p>"{review.review}"</p>
              <h4>{review.userId.fullname}</h4>
              <small>
                Posted on {new Date(review.date).toLocaleDateString()}
              </small>
              <div className="stars">{renderStars(review.rating)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Rating_Review;
