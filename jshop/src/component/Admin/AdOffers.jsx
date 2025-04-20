import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaEye, FaPlus } from "react-icons/fa";

const AdOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("add");
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    offerCode: "",
    description: "",
    rate: "",
    maxdiscount: "",
    orderTotal: "",
    startDate: "",
    endDate: "",
    status: "Active",
    banner: null,
  });
  const [previewImage, setPreviewImage] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchOffers();
  }, []);

  const generateOfferCode = () => {
    const prefixes = ["SAVE", "OFFER", "DEAL", "DISC", "WOW", "FLAT"];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNumber = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `${randomPrefix}${randomNumber}`;
  };

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/OfferModel/");
      setOffers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching offers:", error);
      setLoading(false);
    }
  };

  const openForm = (type, offer = null) => {
    setFormType(type);
    setErrors({});

    if (type === "add") {
      setFormData({
        title: "",
        offerCode: generateOfferCode(),
        description: "",
        rate: "",
        maxdiscount: "",
        orderTotal: "",
        startDate: "",
        endDate: "",
        status: "Active",
        banner: null,
      });
      setPreviewImage("");
    } else {
      setSelectedOffer(offer);
      setFormData({
        title: offer.title,
        offerCode:
          offer.offerCode || offer.title.replace(/\s+/g, "").toUpperCase(),
        description: offer.description,
        rate: offer.rate,
        maxdiscount: offer.maxdiscount,
        orderTotal: offer.orderTotal,
        startDate: new Date(offer.startDate).toISOString().split("T")[0],
        endDate: new Date(offer.endDate).toISOString().split("T")[0],
        status: offer.status,
      });
      if (offer.banner) {
        setPreviewImage(
          `http://localhost:5000/public/images/banner_images/${offer.banner}`
        );
      } else {
        setPreviewImage("");
      }
    }

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedOffer(null);
    setErrors({});
    setPreviewImage("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, banner: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.description)
      newErrors.description = "Description is required";
    if (!formData.rate) newErrors.rate = "Discount rate is required";
    else if (isNaN(formData.rate) || formData.rate <= 0 || formData.rate > 100)
      newErrors.rate = "Discount rate must be between 1 and 100";

    if (!formData.maxdiscount)
      newErrors.maxdiscount = "Maximum discount is required";
    else if (isNaN(formData.maxdiscount) || formData.maxdiscount <= 0)
      newErrors.maxdiscount = "Maximum discount must be a positive number";

    if (!formData.orderTotal)
      newErrors.orderTotal = "Minimum order total is required";
    else if (isNaN(formData.orderTotal) || formData.orderTotal < 0)
      newErrors.orderTotal =
        "Minimum order total must be a non-negative number";

    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    else if (new Date(formData.startDate) > new Date(formData.endDate))
      newErrors.endDate = "End date must be after start date";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const data = new FormData();

      // Append text fields
      Object.keys(formData).forEach((key) => {
        if (key !== "banner" || formData[key] === null) {
          data.append(key, formData[key]);
        }
      });

      // Append file if exists
      if (formData.banner instanceof File) {
        data.append("banner", formData.banner);
      }

      if (formType === "add") {
        await axios.post("http://localhost:5000/api/OfferModel/add", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else if (formType === "edit") {
        await axios.put(
          `http://localhost:5000/api/OfferModel/update/${selectedOffer._id}`,
          data,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }

      closeForm();
      fetchOffers();
    } catch (error) {
      console.error("Error saving offer:", error);
      alert(
        "Failed to save offer: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this offer?")) {
      try {
        await axios.delete(`http://localhost:5000/api/OfferModel/delete/${id}`);
        fetchOffers();
      } catch (error) {
        console.error("Error deleting offer:", error);
        alert(
          "Failed to delete offer: " +
            (error.response?.data?.message || error.message)
        );
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Offers</h2>
        <button className="btn btn-primary" onClick={() => openForm("add")}>
          <FaPlus className="me-2" /> Add New Offer
        </button>
      </div>

      {/* Form Section - Above Table */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>
                {formType === "add"
                  ? "Add New Offer"
                  : formType === "edit"
                  ? "Edit Offer"
                  : "View Offer Details"}
              </h4>
              <button className="btn btn-close" onClick={closeForm}></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.title ? "is-invalid" : ""
                    }`}
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    readOnly={formType === "view"}
                  />
                  {errors.title && (
                    <div className="invalid-feedback">{errors.title}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Offer Code</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      name="offerCode"
                      value={formData.offerCode}
                      onChange={handleChange}
                      readOnly={formType === "view"}
                      pattern="[A-Za-z0-9]+"
                      maxLength={10}
                    />
                    {formType === "add" && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            offerCode: generateOfferCode(),
                          })
                        }
                      >
                        Generate
                      </button>
                    )}
                  </div>
                  <small className="text-muted">
                    Generated Automatically..😉💡
                  </small>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className={`form-control ${
                    errors.description ? "is-invalid" : ""
                  }`}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  readOnly={formType === "view"}
                  rows="2"
                ></textarea>
                {errors.description && (
                  <div className="invalid-feedback">{errors.description}</div>
                )}
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Discount Rate (%)</label>
                  <input
                    type="number"
                    className={`form-control ${
                      errors.rate ? "is-invalid" : ""
                    }`}
                    name="rate"
                    value={formData.rate}
                    onChange={handleChange}
                    readOnly={formType === "view"}
                  />
                  {errors.rate && (
                    <div className="invalid-feedback">{errors.rate}</div>
                  )}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Max Discount (₹)</label>
                  <input
                    type="number"
                    className={`form-control ${
                      errors.maxdiscount ? "is-invalid" : ""
                    }`}
                    name="maxdiscount"
                    value={formData.maxdiscount}
                    onChange={handleChange}
                    readOnly={formType === "view"}
                  />
                  {errors.maxdiscount && (
                    <div className="invalid-feedback">{errors.maxdiscount}</div>
                  )}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Min. Order Total (₹)</label>
                  <input
                    type="number"
                    className={`form-control ${
                      errors.orderTotal ? "is-invalid" : ""
                    }`}
                    name="orderTotal"
                    value={formData.orderTotal}
                    onChange={handleChange}
                    readOnly={formType === "view"}
                  />
                  {errors.orderTotal && (
                    <div className="invalid-feedback">{errors.orderTotal}</div>
                  )}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className={`form-control ${
                      errors.startDate ? "is-invalid" : ""
                    }`}
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    readOnly={formType === "view"}
                  />
                  {errors.startDate && (
                    <div className="invalid-feedback">{errors.startDate}</div>
                  )}
                </div>
                <div className="col-md-4">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className={`form-control ${
                      errors.endDate ? "is-invalid" : ""
                    }`}
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    readOnly={formType === "view"}
                  />
                  {errors.endDate && (
                    <div className="invalid-feedback">{errors.endDate}</div>
                  )}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={formType === "view"}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Banner Image</label>
                {formType !== "view" && (
                  <input
                    type="file"
                    className="form-control mb-2"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                )}
                {previewImage && (
                  <div className="text-center mt-2">
                    <img
                      src={previewImage}
                      alt="Banner Preview"
                      className="img-fluid"
                      style={{ maxHeight: "200px" }}
                    />
                  </div>
                )}
              </div>

              {formType !== "view" && (
                <div className="d-flex justify-content-end mt-3">
                  <button
                    type="button"
                    className="btn btn-secondary me-2"
                    onClick={closeForm}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {formType === "add" ? "Add Offer" : "Update Offer"}
                  </button>
                </div>
              )}

              {formType === "view" && (
                <div className="d-flex justify-content-end mt-3">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeForm}
                  >
                    Close
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Table Section */}
      {loading ? (
        <div className="text-center">Loading offers...</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead className="bg-dark text-white">
              <tr>
                <th>Title</th>
                <th>Discount</th>
                <th>Min. Order</th>
                <th>Validity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.length > 0 ? (
                offers.map((offer) => (
                  <tr key={offer._id}>
                    <td>{offer.title}</td>
                    <td>
                      {offer.rate}% (up to ₹{offer.maxdiscount})
                    </td>
                    <td>₹{offer.orderTotal}</td>
                    <td>
                      {formatDate(offer.startDate)} -{" "}
                      {formatDate(offer.endDate)}
                    </td>
                    <td>
                      <span
                        className={`badge bg-${
                          offer.status === "Active" ? "success" : "danger"
                        }`}
                      >
                        {offer.status}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-info me-1"
                          onClick={() => openForm("view", offer)}
                        >
                          <FaEye />
                        </button>
                        <button
                          className="btn btn-sm btn-warning me-1"
                          onClick={() => openForm("edit", offer)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(offer._id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No offers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdOffers;
