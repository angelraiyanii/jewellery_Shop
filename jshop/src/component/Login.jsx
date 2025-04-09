import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import bg from "./Images/bg.png";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(""); // Added success message state
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = (data) => {
    let errors = {};

    if (!data.email) {
      errors.email = "Email is required.";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(data.email)) {
      errors.email = "Invalid email format.";
    }

    if (!data.password) {
      errors.password = "Password is required.";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      try {
        const response = await axios.post(
          "http://localhost:5000/api/Login/login",
          formData
        );
        const { data } = response;

        // Store token and user data as before
        localStorage.setItem(`${data.user.role}token`, data.token);
        localStorage.setItem(data.user.role, JSON.stringify(data.user));
        
        // Also store in the format expected by Wishlist component
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userId', data.user.id);

        // Show success message
        setSuccessMessage("Successfully logged in!");

        setTimeout(() => {
          if (data.user.role === "admin" || data.user.role === "user") {
            navigate("/");
            window.location.reload();
          }
          setSuccessMessage("");
        }, 3000);
      } catch (error) {
        console.error("Login error:", error.response?.data || error.message);
        setErrors({
          general:
            "Login failed. Please check your credentials or try again later.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "500px",
      }}
    >
      <div
        className="card shadow-lg p-4"
        style={{ width: "350px", background: "rgba(197, 180, 143, 0.9)" }}
      >
        <h3 className="text-center mb-4">Login Now</h3>

        {/* Display success message */}
        {successMessage && (
          <div className="alert alert-success text-center">
            {successMessage}
          </div>
        )}

        {/* Display error message */}
        {errors.general && !successMessage && (
          <div className="alert alert-danger">{errors.general}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-bold">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-control form-control-sm ${
                errors.email ? "is-invalid" : ""
              }`}
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label fw-bold">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-control form-control-sm ${
                errors.password ? "is-invalid" : ""
              }`}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
            {errors.password && (
              <div className="invalid-feedback">{errors.password}</div>
            )}
          </div>

          <p className="text-center mt-3">
            <Link to="/ForgotPassword">Forgot Password?</Link>
          </p>

          <button
            type="submit"
            className="btn btn-primary w-50 d-block mx-auto"
            disabled={loading}
          >
            {loading ? "Loading..." : "Submit"}
          </button>

          <p className="text-center mt-3">
            Don't have an account?{" "}
            <Link to="/Registor" className="text-danger">
              Register Now
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
