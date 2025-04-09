import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import bg from "./Images/bg.png";
import { Link } from "react-router-dom";
import axios from "axios";

const Registor = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    mobile: "",
    gender: "",
    address: "",
    password: "",
    pincode: "",
    profilePic: null,
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = (data) => {
    let errors = {};

    if (!data.fullname) errors.fullname = "Full name is required.";
    else if (data.fullname.length < 3)
      errors.fullname = "Full name must be at least 3 characters.";

    if (!data.email) errors.email = "Email is required.";
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(data.email))
      errors.email = "Invalid email format.";

    if (!data.mobile) errors.mobile = "Mobile number is required.";
    else if (!/^\d{10}$/.test(data.mobile))
      errors.mobile = "Enter a valid 10-digit mobile number.";

    if (!data.gender) errors.gender = "Please select a gender.";

    if (!data.address) errors.address = "Address is required.";
    if (!data.password) errors.password = "password is required.";

    if (!data.pincode) errors.pincode = "Pincode is required.";
    else if (!/^\d{6}$/.test(data.pincode))
      errors.pincode = "Pincode must be a 6-digit number.";

    if (!data.profilePic) errors.profilePic = "Profile image is required.";

    return errors;
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, profilePic: file });

    // Preview the selected image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  //backend

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataObj = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataObj.append(key, formData[key]);
    });

    try {
      const response = await axios.post(
       "http://localhost:5000/api/Login/add-Login",

        formDataObj,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("User added: ", response.data);
      alert("User added successfully!");
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center "
      style={{
        backgroundImage: `url(${bg})`,

        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "900px",
      }}
    >
      <div
        className="card shadow-lg p-4 w-100"
        style={{ maxWidth: "600px", background: "rgba(197, 180, 143, 0.9)" }}
      >
        <h2 className="text-center mb-4 ">Register Now</h2>
        <form onSubmit={handleSubmit} method="post">
          {/* Full Name */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Full Name</label>
              <input
                type="text"
                name="fullname"
                className={`form-control ${
                  errors.fullname ? "is-invalid" : ""
                }`}
                value={formData.fullname}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
              {errors.fullname && (
                <div className="invalid-feedback">{errors.fullname}</div>
              )}
            </div>
            {/* Email */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Email</label>
              <input
                type="email"
                name="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>
          </div>
          {/* Mobile */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Mobile No</label>
              <input
                type="tel"
                name="mobile"
                className={`form-control ${errors.mobile ? "is-invalid" : ""}`}
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter your mobile number"
              />
              {errors.mobile && (
                <div className="invalid-feedback">{errors.mobile}</div>
              )}
            </div>

            {/* Gender */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Gender</label>
              <select
                name="gender"
                className={`form-control ${errors.gender ? "is-invalid" : ""}`}
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.gender && (
                <div className="invalid-feedback">{errors.gender}</div>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="mb-3">
            <label className="form-label fw-bold">Address</label>
            <textarea
              name="address"
              className={`form-control ${errors.address ? "is-invalid" : ""}`}
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your address"
              rows="2"
            ></textarea>
            {errors.address && (
              <div className="invalid-feedback">{errors.address}</div>
            )}
          </div>

          {/* password & Pincode */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Password</label>
              <input
                type="text"
                name="password"
                className={`form-control ${
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
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Pincode</label>
              <input
                type="text"
                name="pincode"
                className={`form-control ${errors.pincode ? "is-invalid" : ""}`}
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Enter your pincode"
              />
              {errors.pincode && (
                <div className="invalid-feedback">{errors.pincode}</div>
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div className="mb-3">
            <label className="form-label fw-bold">Profile Image</label>
            <input
              type="file"
              name="profilePic"
              className={`form-control ${
                errors.profilePic ? "is-invalid" : ""
              }`}
              onChange={handleFileChange}
            />

            {errors.profilePic && (
              <div className="invalid-feedback">{errors.profilePic}</div>
            )}
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-3 img-thumbnail"
                width="100"
              />
            )}
          </div>
          {/* Submit Button */}
          <button type="submit" className="btn btn-primary w-50">
            Register
          </button>
          {/* Login Link */}
          <p className="mt-3 text-center">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Registor;
