import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import bg from "./Images/bg.png";
import { Link } from "react-router-dom";

const OTPVerification = () => {
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setOtp(e.target.value);
  };

  const validateOtp = (otp) => {
    if (!otp) {
      return "OTP is required.";
    } else if (!/^[0-9]{6}$/.test(otp)) {
      return "Invalid OTP format. Must be 6 digits.";
    }
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validateOtp(otp);
    setErrors(error);

    if (!error) {
      setMessage("OTP verified successfully!");
      setOtp("");
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
        <h3 className="text-center mb-4">OTP Verification</h3>
        <form onSubmit={handleSubmit}>
          {/* OTP Input */}
          <div className="mb-3">
            <label htmlFor="otp" className="form-label fw-bold">
              Enter OTP
            </label>
            <input
              type="text"
              id="otp"
              name="otp"
              className={`form-control form-control-sm ${errors ? "is-invalid" : ""}`}
              value={otp}
              onChange={handleChange}
              placeholder="Enter 6-digit OTP"
              maxLength="6"
            />
            {errors && <div className="invalid-feedback">{errors}</div>}
          </div>
          {/* Message */}
          {message && <p className="text-success text-center">{message}</p>}
          {/* Submit Button */}
          <button type="submit" className="btn btn-primary w-50 d-block mx-auto">
            Verify OTP
          </button>
          {/* Resend OTP */}
          <p className="text-center mt-3">
            Didn't receive an OTP? <a href="#" className="text-danger">Resend OTP</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default OTPVerification;
