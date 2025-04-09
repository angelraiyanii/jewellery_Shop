import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import bg from "./Images/bg.png";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const validateEmail = (email) => {
    if (!email) {
      return "Email is required.";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      return "Invalid email format.";
    }
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validateEmail(email);
    setErrors(error);

    if (!error) {
      setMessage("Password reset link has been sent to your email.");
      setEmail("");
      setErrors("");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center "
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
        <h3 className="text-center mb-4">Forgot Password</h3>
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-bold">
              Enter your email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-control form-control-sm ${errors ? "is-invalid" : ""}`}
              value={email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
            {errors && <div className="invalid-feedback">{errors}</div>}
          </div>
          {/* Message */}
          {message && <p className="text-success text-center">{message}</p>}
          {/* Submit Button */}
         
          <button type="submit" className="btn btn-primary w-50 d-block mx-auto">
            Send Otp
          </button> <Link to="/OTPVerification">
          otp Form
          </Link>
          {/* Back to Login */}
          <p className="text-center mt-3">
            Remembered your password? <Link to="/login" className="text-danger">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
