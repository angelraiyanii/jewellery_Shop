import React, { useState, useEffect } from "react";
import { Carousel } from "react-bootstrap";
import axios from "axios";
import s1 from "./images/slide1.png"; // Default fallback image

const OfferCodeBox = ({ offer }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Use offerCode if available, otherwise fall back to title-based code
    const codeToUse = offer.offerCode
      ? offer.offerCode
      : offer.title
      ? offer.title.replace(/\s+/g, "").toUpperCase()
      : "";

    navigator.clipboard.writeText(codeToUse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="offer-code-box border border-warning p-2 mb-3 text-center"
      onClick={handleCopy}
      style={{ cursor: "pointer" }}
    >
      <div className="small text-light">Use Code</div>
      <div className="fs-4 text-warning fw-bold">
        {offer.offerCode
          ? offer.offerCode
          : offer.title
          ? offer.title.replace(/\s+/g, "").toUpperCase()
          : ""}
      </div>
      <div className="small text-light">
        {copied ? (
          <span className="text-success">Copied!</span>
        ) : (
          "Click to Copy"
        )}
      </div>
    </div>
  );
};

const OfferBanner = () => {
  const [activeOffers, setActiveOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          "http://localhost:5000/api/OfferModel/active"
        );

        console.log("API Response:", response.data); // For debugging

        // Ensure we have an array
        if (Array.isArray(response.data)) {
          setActiveOffers(response.data);
        } else {
          setActiveOffers([]);
          console.error("API response is not an array:", response.data);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching offers:", error);
        setError(error.message);
        setActiveOffers([]);
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  // Debug logging
  useEffect(() => {
    console.log("Active offers state updated:", activeOffers);
  }, [activeOffers]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading offers...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-5">
        <div className="alert alert-danger">Error loading offers: {error}</div>
      </div>
    );
  }

  return (
    <div className="offer-banner-container">
      <Carousel fade interval={5000} indicators={true}>
        {activeOffers && activeOffers.length > 0 ? (
          activeOffers.map((offer) => (
            <Carousel.Item key={offer._id}>
              <div className="banner-wrapper position-relative">
                <img
                className="d-block w-100 h-100"
                  src={
                    offer.banner
                      ? `http://localhost:5000/public/images/banner_images/${offer.banner}`
                      : s1 // Fallback to default image
                  }
                  alt={offer.title}
                  onError={(e) => {
                    console.log(
                      "Image error for:",
                      offer.banner,
                      "Using fallback"
                    );
                    e.target.src = s1;
                  }} // Fallback if image fails to load
                  style={{ maxHeight: "700px", objectFit: "cover" }}
                />
                <div className="banner-overlay position-absolute w-100 h-100 top-0 start-0 d-flex align-items-center justify-content-end">
                  <div className="offer-content me-5 p-4 bg-dark bg-opacity-75 text-white rounded shadow">
                    <h2 className="text-warning mb-2">{offer.title}</h2>
                    <p className="mb-3">{offer.description}</p>

                    <OfferCodeBox offer={offer} />

                    <div className="offer-info">
                      <p className="mb-1">
                        <span className="text-light">Get </span>
                        <span className="text-warning fw-bold">
                          {offer.rate}% OFF
                        </span>
                      </p>
                      <p className="mb-1">
                        <span className="text-light">Up to </span>
                        <span className="text-warning fw-bold">
                          ₹{offer.maxdiscount}
                        </span>
                      </p>
                      {offer.orderTotal > 0 && (
                        <p className="mb-1">
                          <span className="text-light">Min. order: </span>
                          <span className="text-warning fw-bold">
                            ₹{offer.orderTotal}
                          </span>
                        </p>
                      )}
                      <p className="mb-0 small">
                        Valid till:{" "}
                        {new Date(offer.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Carousel.Item>
          ))
        ) : (
          // Fallback carousel item if no active offers
          <Carousel.Item>
            <img
           className="d-block w-100 h-100"
              src={s1}
              alt="Default slide"
              style={{ maxHeight: "700px", objectFit: "cover" }}
            />
            <Carousel.Caption>
              <h3>Exclusive Jewelry Collection</h3>
              <p>Discover our latest arrivals</p>
            </Carousel.Caption>
          </Carousel.Item>
        )}
      </Carousel>
    </div>
  );
};

export default OfferBanner;
