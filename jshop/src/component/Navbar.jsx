import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaCreditCard,
  FaStar,
  FaAd,
  FaUserCircle,
  FaSignInAlt,
  FaUserPlus,
  FaUser,
  FaSignOutAlt,
  FaHeart,
  FaShoppingCart,
  FaHistory,
  FaList,
  FaBox,
  FaShoppingBag,
  FaPhone,
  FaInfoCircle,
  FaTags,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null); 
  const navigate = useNavigate();

 
  useEffect(() => {
    const userRole =
      localStorage.getItem("user") || localStorage.getItem("admin");
    if (userRole) {
      setUser(JSON.parse(userRole)); 
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("usertoken");
    localStorage.removeItem("admintoken");
    localStorage.removeItem("user");
    localStorage.removeItem("admin");
    setUser(null);
    navigate("/");
  };

  const isAdmin = user && user.role === "admin";

  return (
    <nav
      className="navbar navbar-expand-lg top-0 w-100 d-flex flex-column align-items-center"
      style={{
        backgroundColor: "#4a281a",
        height: "auto",
        zIndex: "1000",
        padding: "10px 0",
      }}
    >
      <div className="container-fluid text-center">
        <Link className="navbar-brand text-white fw-bold" to="/">
          Jewellery Shop
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse ${
            isMenuOpen ? "show" : ""
          } text-center`}
          style={{ backgroundColor: "#4a281a" }}
        >
          <ul className="navbar-nav mx-auto text-center">
            <li className="nav-item">
              <Link className="nav-link text-white" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/Ct_product">
                Product
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/Aboutus">
                About Us
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/Contactus">
                Contact Us
              </Link>
            </li>

            {/* Admin Menu - Show only if user is an admin */}
            {isAdmin && (
              <li className="nav-item dropdown">
                <Link
                  className="nav-link dropdown-toggle text-white"
                  to="#"
                  id="adminDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Admin
                </Link>
                <ul className="dropdown-menu" aria-labelledby="adminDropdown">
                  <li>
                    <Link
                      className="dropdown-item d-flex align-items-center"
                      to="/Admin/AdCategory"
                    >
                      <FaList className="me-2 text-primary" /> Category
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item d-flex align-items-center"
                      to="/Admin/AdPro"
                    >
                      <FaBox className="me-2 text-success" /> Product
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item d-flex align-items-center"
                      to="/Admin/AdUser"
                    >
                      <FaUser className="me-2 text-info" /> User
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item d-flex align-items-center"
                      to="/Admin/AdOrder"
                    >
                      <FaShoppingBag className="me-2 text-warning" /> Order
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item d-flex align-items-center"
                      to="/Admin/AdOffers"
                    >
                      <FaTags className="me-2 text-primary" /> Offers
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item d-flex align-items-center"
                      to="/Admin/AdReviews"
                    >
                      <FaStar className="me-2 text-success" /> Reviews
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item d-flex align-items-center"
                      to="/Admin/AdBanner"
                    >
                      <FaAd className="me-2 text-info" /> Banners
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item d-flex align-items-center"
                      to="/Admin/AdContact"
                    >
                      <FaPhone className="me-2 text-danger" /> Contact
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item d-flex align-items-center"
                      to="/Admin/AdAbout"
                    >
                      <FaInfoCircle className="me-2 text-secondary" /> About Us
                    </Link>
                  </li>
                </ul>
              </li>
            )}
          </ul>

          {/* User Dropdown */}
          <div className="dropdown position-relative">
            <button
              className="btn text-white fs-4 dropdown-toggle"
              type="button"
              id="userDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <FaUserCircle />
              {user && <span className="ms-2">{user.fullname}</span>}{" "}
              {/* Display username */}
            </button>
            <ul
              className="dropdown-menu dropdown-menu-end"
              aria-labelledby="userDropdown"
            >
              {/* Show email and username if logged in */}
              {user && (
                <>
                  <li className="dropdown-item-text">
                    <FaUser className="me-2 text-info" /> {user.fullname}
                  </li>
                  <li className="dropdown-item-text">
                    <span className="me-2"></span> {user.email}
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                </>
              )}

              {/* Show Login/Signup if not logged in */}
              {!user && (
                <>
                  <li>
                    <Link
                      className="dropdown-item d-flex align-items-center"
                      to="/Login"
                    >
                      <FaSignInAlt className="me-2 text-primary" /> Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item d-flex align-items-center"
                      to="/Registor"
                    >
                      <FaUserPlus className="me-2 text-success" /> Signup
                    </Link>
                  </li>
                </>
              )}

              {/* Show user options if logged in */}
              {user && (
                <>
                  <li>
                    <Link
                      className="dropdown-item d-flex align-items-center"
                      to="/Account"
                    >
                      <FaUser className="me-2 text-info" /> Account
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item d-flex align-items-center"
                      to="/Wishlist"
                    >
                      <FaHeart className="me-2 text-danger" /> Wishlist
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item d-flex align-items-center"
                      to="/Cart"
                    >
                      <FaShoppingCart className="me-2 text-primary" /> Cart
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item d-flex align-items-center"
                      to="/Checkout"
                    >
                      <FaCreditCard className="me-2 text-danger" /> Checkout
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item d-flex align-items-center"
                      to="/OrderHistory"
                    >
                      <FaHistory className="me-2 text-warning" /> Order History
                    </Link>
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger d-flex align-items-center"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt className="me-2" /> Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
