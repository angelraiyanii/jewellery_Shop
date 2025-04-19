import React, { useState, useEffect } from "react";
import { Carousel } from "react-bootstrap";
import axios from "axios";
import s1 from "./images/slide1.png"; // Default fallback image

// OfferCodeBox component should be moved outside the OfferBanner component
const OfferCodeBox = ({ offer }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(
      offer.title ? offer.title.replace(/\s+/g, "").toUpperCase() : ""
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Show "Copied!" for 2 seconds
  };

  return (
    <div
      className="offer-code-box border border-warning p-2 mb-3 text-center"
      onClick={handleCopy}
      style={{ cursor: "pointer" }}
    >
      <div className="small text-light">Use Code</div>
      <div className="fs-4 text-warning fw-bold">
        {offer.title ? offer.title.replace(/\s+/g, "").toUpperCase() : ""}
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

  // Fetch active offers on mount
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5000/api/OfferModel/active"
        );
        console.log("Active offers:", response.data); // For debugging
        setActiveOffers(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching offers:", error);
        setActiveOffers([]);
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  // Log status - helpful for debugging
  useEffect(() => {
    console.log("Active offers state:", activeOffers);
  }, [activeOffers]);

  if (loading) {
    return <div>Loading offers...</div>;
  }

  return (
    <div className="offer-banner-container">
      <Carousel fade interval={5000} indicators={true}>
        {activeOffers && activeOffers.length > 0 ? (
          activeOffers.map((offer) => (
            <Carousel.Item key={offer._id}>
              <div className="banner-wrapper position-relative">
                <img
                  className="d-block w-100"
                  src={
                    offer.banner
                      ? `http://localhost:5000/public/images/banner_images/${offer.banner}`
                      : s1 // Fallback to default image
                  }
                  alt={offer.title}
                  onError={(e) => {
                    console.log("Image error, using fallback");
                    e.target.src = s1;
                  }} // Fallback if image fails to load
                  style={{ maxHeight: "400px", objectFit: "cover" }}
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
              className="d-block w-100"
              src={s1}
              alt="Default slide"
              style={{ maxHeight: "400px", objectFit: "cover" }}
            />
            <Carousel.Caption>
              <h3>Exclusive Jewelry Collection</h3>
              <p>Discover our latest arrivals</p>
            </Carousel.Caption>
          </Carousel.Item>
        )}
      </Carousel>

      {/* Add custom CSS for the banner */}
      <style jsx="true">{`
        .offer-banner-container {
          margin-bottom: 2rem;
        }
        .banner-wrapper {
          overflow: hidden;
        }
        .banner-overlay {
          background: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.4) 100%
          );
        }
        .offer-content {
          max-width: 400px;
        }
        .offer-code-box {
          border-style: dashed !important;
        }
        @media (max-width: 768px) {
          .offer-content {
            max-width: 80%;
            margin-right: 10% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OfferBanner;
