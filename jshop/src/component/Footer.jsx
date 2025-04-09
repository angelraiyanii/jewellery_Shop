import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer
      className=" text-white py-4"
      style={{ backgroundColor: "#4a281a", zIndex: "1000" }}
    >
      <div className="container ">
        <div className="row">
          {/* About Section */}
          <div className="col-md-4">
            <h5>About Us</h5>
            <p>
              Discover timeless elegance with our exquisite jewelry collection.
              Crafted with passion, designed for beauty.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-4">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li>
                <Link to="/" className="text-white text-decoration-none">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/collection"
                  className="text-white text-decoration-none"
                >
                  Collections
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="text-white text-decoration-none"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white text-decoration-none">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="col-md-4">
            <h5>Contact Us</h5>
            <p>
              <FaMapMarkerAlt className="me-2" /> 456 Luxury Lane, New York, USA
            </p>
            <p>
              <FaPhoneAlt className="me-2" /> +91 2223344567
            </p>
            <p>
              <FaEnvelope className="me-2" /> support@jewelshop.com
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-3">
          <p className="mb-0">
            &copy; {new Date().getFullYear()} JewelShop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
