import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../App.css";

const AdOffers = () => {
  const [offers, setOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editOfferId, setEditOfferId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    maxdiscount: "",
    description: "",
    rate: "",
    startDate: "",
    endDate: "",
    orderTotal: "",
    banner: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [expandedOfferId, setExpandedOfferId] = useState(null); // New state to track expanded row

  // Fetch all offers when component mounts
  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:5000/api/OfferModel/");
      const offerList = Array.isArray(response.data) ? response.data : response.data.data;
      setOffers(offerList);
      setIsLoading(false);
    } catch (error) {
      setMessage({
        text: "Failed to fetch offers: " + error.message,
        type: "danger",
      });
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!formData.title.trim()) tempErrors.title = "Title is required.";
    if (!formData.description.trim()) tempErrors.description = "Description is required.";
    if (!formData.maxdiscount.trim()) tempErrors.maxdiscount = "Maximum Discount Amount is required.";
    if (!formData.rate.trim()) tempErrors.rate = "Rate is required.";
    else if (!/^\d+%$/.test(formData.rate)) tempErrors.rate = "Rate should be in percentage format (e.g., 30%).";
    if (!formData.startDate) tempErrors.startDate = "Start Date is required.";
    if (!formData.endDate) tempErrors.endDate = "End Date is required.";
    else {
      const today = new Date().toISOString().split("T")[0];
      if (formData.endDate < today && !isEditMode) tempErrors.endDate = "Date cannot be in the past.";
    }
    if (!formData.orderTotal.trim()) tempErrors.orderTotal = "Order Total is required.";
    if (!isEditMode && !formData.banner.trim()) tempErrors.banner = "Banner is required.";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setIsLoading(true);
        let response;

        if (isEditMode) {
          response = await axios.put(
            `http://localhost:5000/api/OfferModel/update/${editOfferId}`,
            formData
          );
          if (response.data.success) {
            setMessage({ text: "Offer updated successfully!", type: "success" });
            fetchOffers();
          }
        } else {
          response = await axios.post("http://localhost:5000/api/offers/add", formData);
          if (response.data.success) {
            setMessage({ text: "Offer added successfully!", type: "success" });
            fetchOffers();
          }
        }
        resetForm();
      } catch (error) {
        setMessage({
          text: `Failed to ${isEditMode ? "update" : "add"} offer: ${error.response?.data?.message || error.message}`,
          type: "danger",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEdit = (id) => {
    const offerToEdit = offers.find((offer) => offer._id === id);
    if (offerToEdit) {
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };
      setFormData({
        title: offerToEdit.title,
        description: offerToEdit.description,
        maxdiscount: offerToEdit.maxdiscount || "",
        rate: offerToEdit.discount || "",
        startDate: formatDate(offerToEdit.startDate || offerToEdit.validity || new Date()),
        endDate: formatDate(offerToEdit.endDate || offerToEdit.validity || new Date()),
        orderTotal: offerToEdit.orderTotal || "",
        banner: offerToEdit.banner || "",
      });
      setEditOfferId(id);
      setIsEditMode(true);
      setShowForm(true);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this offer?")) {
      try {
        setIsLoading(true);
        const response = await axios.delete(`http://localhost:5000/api/offers/delete/${id}`);
        if (response.data.success) {
          setMessage({ text: "Offer deleted successfully!", type: "success" });
          fetchOffers();
        }
      } catch (error) {
        setMessage({
          text: "Failed to delete offer: " + (error.response?.data?.message || error.message),
          type: "danger",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      maxdiscount: "",
      description: "",
      rate: "",
      startDate: "",
      endDate: "",
      orderTotal: "",
      banner: "",
    });
    setIsEditMode(false);
    setEditOfferId(null);
    setShowForm(false);
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, banner: file.name });
    }
  };

  // Toggle expanded row
  const handleView = (id) => {
    setExpandedOfferId(expandedOfferId === id ? null : id); // Toggle: expand if collapsed, collapse if expanded
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Admin Offers</h2>

      {message.text && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          {message.text}
          <button
            type="button"
            className="btn-close"
            onClick={() => setMessage({ text: "", type: "" })}
          ></button>
        </div>
      )}

      <div className="d-flex justify-content-between mb-3">
        <div className="d-flex">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Search offers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn btn-primary">Search</button>
        </div>
        <button
          className="btn btn-success"
          onClick={() => {
            if (isEditMode || showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
        >
          {showForm ? (isEditMode ? "Cancel Edit" : "Close Add Offer Form") : "Add New Offer"}
        </button>
      </div>

      {showForm && (
        <div className="card p-3 mb-4">
          <h4>{isEditMode ? "Edit Offer" : "Add New Offer"}</h4>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-4 mb-2">
                <label>Title:</label>
                <input
                  type="text"
                  className={`form-control ${errors.title ? "is-invalid" : ""}`}
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
              </div>
              <div className="col-4 mb-2">
                <label>Description:</label>
                <textarea
                  className={`form-control ${errors.description ? "is-invalid" : ""}`}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
                {errors.description && (
                  <div className="invalid-feedback">{errors.description}</div>
                )}
              </div>
              <div className="col-4 mb-2">
                <label>Rate:</label>
                <input
                  type="text"
                  className={`form-control ${errors.rate ? "is-invalid" : ""}`}
                  name="rate"
                  value={formData.rate}
                  onChange={handleInputChange}
                  placeholder="e.g., 30%"
                />
                {errors.rate && <div className="invalid-feedback">{errors.rate}</div>}
              </div>
            </div>
            <div className="row">
              <div className="col-4 mb-2">
                <label>Maximum Discount Amount:</label>
                <input
                  type="text"
                  className={`form-control ${errors.maxdiscount ? "is-invalid" : ""}`}
                  name="maxdiscount"
                  value={formData.maxdiscount}
                  onChange={handleInputChange}
                />
                {errors.maxdiscount && (
                  <div className="invalid-feedback">{errors.maxdiscount}</div>
                )}
              </div>
              <div className="col-4 mb-2">
                <label>Order Total:</label>
                <input
                  type="text"
                  className={`form-control ${errors.orderTotal ? "is-invalid" : ""}`}
                  name="orderTotal"
                  value={formData.orderTotal}
                  onChange={handleInputChange}
                />
                {errors.orderTotal && (
                  <div className="invalid-feedback">{errors.orderTotal}</div>
                )}
              </div>
              <div className="col-4 mb-2">
                <label>Start Date:</label>
                <input
                  type="date"
                  className={`form-control ${errors.startDate ? "is-invalid" : ""}`}
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
                {errors.startDate && (
                  <div className="invalid-feedback">{errors.startDate}</div>
                )}
              </div>
            </div>
            <div className="row">
              <div className="col-4 mb-2">
                <label>End Date:</label>
                <input
                  type="date"
                  className={`form-control ${errors.endDate ? "is-invalid" : ""}`}
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
                {errors.endDate && <div className="invalid-feedback">{errors.endDate}</div>}
              </div>
              <div className="col-4 mb-2">
                <label>Banner:</label>
                <input
                  type="file"
                  className={`form-control ${errors.banner ? "is-invalid" : ""}`}
                  name="banner"
                  onChange={handleFileChange}
                />
                {errors.banner && <div className="invalid-feedback">{errors.banner}</div>}
              </div>
              <div className="col-4 mt-4">
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {isLoading ? (
                    <span>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>{" "}
                      {isEditMode ? "Updating..." : "Adding..."}
                    </span>
                  ) : isEditMode ? (
                    "Update Offer"
                  ) : (
                    "Add Offer"
                  )}
                </button>
                {isEditMode && (
                  <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={resetForm}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      )}

      {isLoading && !showForm ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <table className="table table-bordered">
          <thead className="thead table-bordered">
            <tr>
              <th>Offer ID</th>
              <th>Title</th>
              <th>Discount</th>
              <th>Validity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">
                  No offers found
                </td>
              </tr>
            ) : (
              offers
                .filter(
                  (offer) =>
                    offer.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    offer.description?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((offer) => (
                  <React.Fragment key={offer._id}>
                    <tr>
                      <td>{offer._id}</td>
                      <td>{offer.title}</td>
                      <td>{offer.discount}</td>
                      <td>{new Date(offer.validity || offer.endDate).toLocaleDateString()}</td>
                      <td>
                        <span
                          className={`badge ${
                            new Date(offer.validity || offer.endDate) >= new Date()
                              ? "bg-success"
                              : "bg-danger"
                          }`}
                        >
                          {new Date(offer.validity || offer.endDate) >= new Date()
                            ? "Active"
                            : "Expired"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => handleView(offer._id)} // View button
                        >
                          {expandedOfferId === offer._id ? "Hide" : "View"}
                        </button>
                        <button
                          className="btn btn-sm btn-info me-2"
                          onClick={() => handleEdit(offer._id)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(offer._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    {expandedOfferId === offer._id && (
                      <tr>
                        <td colSpan="6">
                          <div className="p-3 bg-light">
                            <h5>Offer Details</h5>
                            <p><strong>Description:</strong> {offer.description}</p>
                            <p><strong>Maximum Discount:</strong> {offer.maxdiscount || "N/A"}</p>
                            <p><strong>Order Total:</strong> {offer.orderTotal || "N/A"}</p>
                            <p>
                              <strong>Start Date:</strong>{" "}
                              {new Date(offer.startDate || offer.validity).toLocaleDateString()}
                            </p>
                            <p>
                              <strong>End Date:</strong>{" "}
                              {new Date(offer.endDate || offer.validity).toLocaleDateString()}
                            </p>
                            <p><strong>Banner:</strong> {offer.banner || "No banner"}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdOffers;