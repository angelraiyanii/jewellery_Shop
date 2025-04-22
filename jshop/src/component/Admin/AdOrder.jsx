import React, { useState, useEffect } from "react";
import "../../App.css";
import axios from "axios";

const AdOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // useEffect
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log("Attempting to fetch orders from API...");

      const response = await axios.get("http://localhost:5000/api/OrderModel", {
        // timeout: 10000,
      });

      console.log("API Response received:", response);

      if (response.data && response.data.orders) {
        setOrders(response.data.orders);
      } else if (response.data && Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        console.warn("API returned unexpected data format:", response.data);
        setError("Server returned data in an unexpected format");
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Error connecting to the server. Please try again later.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = (orderId) => {
    setSelectedOrderId(selectedOrderId === orderId ? null : orderId);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const getUserInfo = (order) => {
    if (order.userId && typeof order.userId === "object" && order.userId.name) {
      return order.userId.name;
    } else if (order.userId && typeof order.userId === "string") {
      return `${order.userId.substring(0, 8)}...`;
    }
    return "Unknown User";
  };

  const getProductInfo = (order) => {
    if (order.items && order.items.length > 0) {
      const item = order.items[0];
      if (
        item.productId &&
        typeof item.productId === "object" &&
        item.productId.productName
      ) {
        return item.productId.productName;
      } else if (item.productId && typeof item.productId === "string") {
        return `${item.productId.substring(0, 8)}...`;
      }
    }
    return "Unknown Product";
  };

  const getOrderAmount = (order) => {
    return order.total || 0;
  };

  const filteredOrders = orders.filter((order) => {
    const userInfo = getUserInfo(order).toLowerCase();
    const productInfo = getProductInfo(order).toLowerCase();
    const orderId = (order._id || "").toString();

    return (
      userInfo.includes(searchTerm.toLowerCase()) ||
      productInfo.includes(searchTerm.toLowerCase()) ||
      orderId.includes(searchTerm)
    );
  });

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Orders</h2>

      <div className="d-flex justify-content-end mb-3">
        <div className="d-flex">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button className="btn btn-primary">Search</button>
        </div>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-warning">
          {error}
          <button className="btn btn-sm btn-primary ms-2" onClick={fetchOrders}>
            Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="alert alert-info">No orders found</div>
      ) : (
        <table className="table table-bordered">
          <thead className="thead table-bordered">
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Product</th>
              <th>Amount ($)</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <React.Fragment key={order._id}>
                <tr>
                  <td>{order._id}</td>
                  <td>{getUserInfo(order)}</td>
                  <td>{getProductInfo(order)}</td>
                  <td>${getOrderAmount(order)}</td>
                  <td>
                    <span
                      className={`badge bg-${
                        order.status === "delivered"
                          ? "success"
                          : order.status === "processing"
                          ? "warning"
                          : order.status === "cancelled"
                          ? "danger"
                          : "info"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => viewOrderDetails(order._id)}
                    >
                      View
                    </button>
                  </td>
                </tr>
                {selectedOrderId === order._id && (
                  <tr>
                    <td colSpan="6">
                      <div className="p-3 bg-light">
                        <h4 className="mb-3">Order Details</h4>
                        <div className="row mb-3">
                          <div className="col-6">
                            <strong>Order ID:</strong> {order._id}
                          </div>
                          <div className="col-6">
                            <strong>Date:</strong>{" "}
                            {new Date(order.createdAt).toLocaleString()}
                          </div>
                        </div>

                        <div className="row mb-3">
                          <div className="col-6">
                            <strong>Customer:</strong> {getUserInfo(order)}
                          </div>
                          <div className="col-6">
                            <strong>Status:</strong> {order.status}
                          </div>
                        </div>

                        <div className="mb-4">
                          <h5>Product Details</h5>
                          <table className="table table-striped">
                            <thead>
                              <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items && order.items.length > 0 ? (
                                order.items.map((item, index) => (
                                  <tr key={index}>
                                    <td>
                                      {item.productId &&
                                      typeof item.productId === "object"
                                        ? item.productId.productName
                                        : typeof item.productId === "string"
                                        ? `Product ID: ${item.productId.substring(
                                            0,
                                            8
                                          )}...`
                                        : "Unknown Product"}
                                    </td>
                                    <td>{item.quantity}</td>
                                    <td>${item.price}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="3">No items found</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        <div className="mb-4">
                          <h5>Shipping Address</h5>
                          {order.shippingAddress ? (
                            <p>
                              {order.shippingAddress.address || "No address"},
                              {order.shippingAddress.city || ""},
                              {order.shippingAddress.state || ""}
                              {order.shippingAddress.zipCode || ""}
                            </p>
                          ) : (
                            <p>No address provided</p>
                          )}
                        </div>

                        <div className="mb-4 row">
                          <div className="col-6">
                            <strong>Subtotal:</strong> ${order.subtotal || 0}
                          </div>
                          <div className="col-6">
                            <strong>Discount:</strong> ${order.discount || 0}
                          </div>
                          <div className="col-12 mt-2">
                            <strong>Total:</strong> ${order.total || 0}
                          </div>
                        </div>

                        <button
                          className="btn btn-danger mt-2"
                          onClick={() => setSelectedOrderId(null)}
                        >
                          Close
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdOrder;
