import React, { useState, useEffect } from "react";
import "../../App.css";
import axios from "axios";

const AdOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [amountSearch, setAmountSearch] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);

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

  const handleAmountSearchChange = (e) => {
    setAmountSearch(e.target.value);
    setCurrentPage(1); 
  };

  const getUserInfo = (order) => {
    if (
      order.userId &&
      typeof order.userId === "object" &&
      order.userId.fullname
    ) {
      return order.userId.fullname;

     // return order.userId.name;
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

  // Filter orders by amount
  const filteredOrders = orders.filter((order) => {
    const orderAmount = getOrderAmount(order).toString();

    if (!amountSearch) {
      return true;
    }

    return orderAmount.includes(amountSearch);
  });

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Orders Manage</h2>

      <div className="d-flex justify-content-end mb-3">
        <div className="d-flex">
          <input
            type="text"
            className="form-control me-2"
            placeholder="🔎Search by amount..."
            value={amountSearch}
            onChange={handleAmountSearchChange}
          />
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
            {currentOrders.map((order) => (
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
      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <div className="row mt-3">
          <div className="col-md-12 d-flex justify-content-center">
            <nav>
              <ul className="pagination">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    « Prev
                  </button>
                </li>

                {pageNumbers.map((number) => (
                  <li
                    key={number}
                    className={`page-item ${
                      currentPage === number ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(number)}
                    >
                      {number}
                    </button>
                  </li>
                ))}

                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next »
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdOrder;
