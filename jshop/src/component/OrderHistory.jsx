import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Modal, Button, Spinner } from "react-bootstrap";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Get user ID from local storage or context
  const userId = localStorage.getItem("userId") || "";

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/OrderModel/user/${userId}`
        );

        if (response.data.success) {
          setOrders(response.data.orders);
        } else {
          throw new Error(response.data.message || "Failed to fetch orders");
        }
      } catch (err) {
        console.error("Error fetching order history:", err);
        setError(err.message || "Failed to load your order history");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchOrders();
    } else {
      setLoading(false);
      setError("Please log in to view your order history");
    }
  }, [userId]);

  // Function to fetch order details
  const fetchOrderDetails = async (orderId) => {
    try {
      setDetailsLoading(true);
      setDetailsError(null);

      const response = await axios.get(
        `http://localhost:5000/api/OrderModel/${orderId}`
      );

      if (response.data.success) {
        setOrderDetails(response.data.order);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch order details"
        );
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      setDetailsError(err.message || "Failed to load order details");
    } finally {
      setDetailsLoading(false);
    }
  };

  // Function to open the order details modal
  const openOrderDetails = (orderId) => {
    setSelectedOrderId(orderId);
    fetchOrderDetails(orderId);
  };

  // Function to close the order details modal
  const closeOrderDetails = () => {
    setSelectedOrderId(null);
    setOrderDetails(null);
    setDetailsError(null);
  };

  // Function to get the full image URL
  const getImageUrl = (imagePath) => {
    return `http://localhost:5000/public/images/product_images/${imagePath}`;
  };

  // Function to open image preview modal
  const openImagePreview = (imagePath) => {
    setSelectedImage(getImageUrl(imagePath));
  };

  // Function to close image preview modal
  const closeImagePreview = () => {
    setSelectedImage(null);
  };

  // Get first product image from order (for card thumbnail)
  const getOrderThumbnail = (order) => {
    if (order.items && order.items.length > 0) {
      const firstItem = order.items.find(
        item => item.productId && item.productId.productImage
      );
      return firstItem?.productId?.productImage || null;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading orders...</span>
        </div>
        <p className="mt-2">Loading your order history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
        <Link to="/login" className="btn btn-primary">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Your Order History</h2>

      {orders.length === 0 ? (
        <div className="alert alert-info">
          You don't have any orders yet.
          <div className="mt-3">
            <Link to="/" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="row">
          {orders.map((order) => (
            <div key={order._id} className="col-md-6 mb-4">
              <div className="card">
                <div className="card-header d-flex justify-content-between">
                  <span>
                    Order #{order._id.substring(order._id.length - 8)}
                  </span>
                  <span
                    className={`badge bg-${
                      order.status === "delivered"
                        ? "success"
                        : order.status === "shipped"
                        ? "info"
                        : order.status === "cancelled"
                        ? "danger"
                        : "warning"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      {getOrderThumbnail(order) ? (
                        <img
                          src={getImageUrl(getOrderThumbnail(order))}
                          alt="Order Thumbnail"
                          className="img-fluid rounded cursor-pointer"
                          style={{ 
                            width: "100%", 
                            height: "100px", 
                            objectFit: "cover",
                            cursor: "pointer"
                          }}
                          onClick={() => openImagePreview(getOrderThumbnail(order))}
                        />
                      ) : (
                        <div 
                          className="bg-light d-flex align-items-center justify-content-center rounded"
                          style={{ height: "100px" }}
                        >
                          <span className="text-muted">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="col-md-8">
                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Items:</strong> {order.items.length}
                      </p>
                      <p>
                        <strong>Total:</strong> ₹{order.total.toFixed(2)}
                      </p>
                      <div className="mt-2">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openOrderDetails(order._id)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      <Modal
        show={selectedOrderId !== null}
        onHide={closeOrderDetails}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailsLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading order details...</p>
            </div>
          ) : detailsError ? (
            <div className="alert alert-danger">{detailsError}</div>
          ) : orderDetails ? (
            <div>
              <div className="mb-4">
                <h5 className="border-bottom pb-2">Order Information</h5>
                <div className="row">
                  <div className="col-md-6">
                    <p>
                      <strong>Order ID:</strong> {orderDetails._id}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(orderDetails.createdAt).toLocaleString()}
                    </p>
                    <p>
                      <strong>Status:</strong>
                      <span
                        className={`badge ms-2 bg-${
                          orderDetails.status === "delivered"
                            ? "success"
                            : orderDetails.status === "shipped"
                            ? "info"
                            : orderDetails.status === "cancelled"
                            ? "danger"
                            : "warning"
                        }`}
                      >
                        {orderDetails.status}
                      </span>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p>
                      <strong>Subtotal:</strong> ₹
                      {orderDetails.subtotal.toFixed(2)}
                    </p>
                    {orderDetails.discount > 0 && (
                      <p>
                        <strong>Discount:</strong> ₹
                        {orderDetails.discount.toFixed(2)}
                      </p>
                    )}
                    {orderDetails.offerName && (
                      <p>
                        <strong>Applied Offer:</strong> {orderDetails.offerName}
                      </p>
                    )}
                    <p>
                      <strong>Total Amount:</strong>{" "}
                      <span className="fw-bold">
                        ₹{orderDetails.total.toFixed(2)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="border-bottom pb-2">Shipping Address</h5>
                <p>{orderDetails.shippingAddress.address}</p>
                <p>
                  {orderDetails.shippingAddress.city},{" "}
                  {orderDetails.shippingAddress.state} -{" "}
                  {orderDetails.shippingAddress.zipCode}
                </p>
                <p>Email: {orderDetails.shippingAddress.email}</p>
                <p>Phone: {orderDetails.shippingAddress.phone}</p>
              </div>

              <div>
                <h5 className="border-bottom pb-2">Order Items</h5>
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderDetails.items.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <div className="d-flex align-items-center">
                              {item.productId &&
                                item.productId.productImage && (
                                  <img
                                    src={getImageUrl(item.productId.productImage)}
                                    alt={item.productId.productName}
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      objectFit: "cover",
                                      marginRight: "10px",
                                      cursor: "pointer"
                                    }}
                                    onClick={() => openImagePreview(item.productId.productImage)}
                                  />
                                )}
                              <span>
                                {item.productId
                                  ? item.productId.productName
                                  : "Product Unavailable"}
                              </span>
                            </div>
                          </td>
                          <td>₹{item.price.toFixed(2)}</td>
                          <td>{item.quantity}</td>
                          <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-warning">No order details found</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeOrderDetails}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        show={selectedImage !== null}
        onHide={closeImagePreview}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Image Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-0">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Product Preview"
              className="img-fluid"
              style={{ maxHeight: "70vh", width: "100%", objectFit: "contain" }}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeImagePreview}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrderHistory;
