import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import c5 from "./Images/category.png"; // Keeping your existing import

class OrderHistory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      isLoading: true,
      error: null,
    };
  }

  componentDidMount() {
    this.fetchOrderHistory();
  }

  fetchOrderHistory = async () => {
    try {
      // Assuming your API endpoint for order history exists
      // You'll need to modify this URL to match your actual endpoint
      const response = await axios.get("http://localhost:5000/api/user/orders");

      this.setState({
        orders: response.data.orders,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching order history:", error);
      this.setState({
        error:
          "Failed to load order history: " +
          (error.response?.data?.message || error.message),
        isLoading: false,
      });
    }
  };

  render() {
    const { orders, isLoading, error } = this.state;

    if (isLoading) {
      return (
        <div className="container mt-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading your order history...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="container mt-5">
          <div className="alert alert-danger">{error}</div>
          <Link to="/" className="btn btn-primary">
            Return to Home
          </Link>
        </div>
      );
    }

    // For demonstration, using a sample order if no orders are found
    const sampleOrders = orders.length
      ? orders
      : [
          {
            id: "12345",
            date: new Date().toLocaleDateString(),
            products: [
              {
                id: "prod1",
                name: "Diamond Earring",
                category: "Earring",
                image: c5,
                price: 1598.22,
                quantity: 1,
              },
            ],
            totalAmount: 1598.22,
            status: "Delivered",
          },
        ];

    return (
      <div className="container my-5">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-primary text-white py-3">
            <h3 className="mb-0">My Order History</h3>
          </div>

          <div className="card-body p-0">
            {sampleOrders.length === 0 ? (
              <div className="text-center py-5">
                <i
                  className="bi bi-bag-x"
                  style={{ fontSize: "3rem", color: "#ccc" }}
                ></i>
                <h5 className="mt-3">No orders found</h5>
                <p className="text-muted">You haven't placed any orders yet.</p>
                <Link to="/products" className="btn btn-primary mt-2">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="accordion" id="orderAccordion">
                {sampleOrders.map((order, index) => (
                  <div className="accordion-item" key={order.id}>
                    <h2 className="accordion-header" id={`heading${index}`}>
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#collapse${index}`}
                        aria-expanded="false"
                        aria-controls={`collapse${index}`}
                      >
                        <div className="d-flex w-100 justify-content-between align-items-center">
                          <div>
                            <strong>Order #</strong> {order.id}
                            <span className="ms-3 badge bg-secondary">
                              {order.date}
                            </span>
                          </div>
                          <div>
                            <span
                              className={`badge ${
                                order.status === "Delivered"
                                  ? "bg-success"
                                  : order.status === "Processing"
                                  ? "bg-warning"
                                  : "bg-info"
                              }`}
                            >
                              {order.status}
                            </span>
                            <span className="ms-3 fw-bold">
                              ₹{order.totalAmount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </button>
                    </h2>
                    <div
                      id={`collapse${index}`}
                      className="accordion-collapse collapse"
                      aria-labelledby={`heading${index}`}
                      data-bs-parent="#orderAccordion"
                    >
                      <div className="accordion-body p-0">
                        <div className="table-responsive">
                          <table className="table table-striped mb-0">
                            <thead className="table-light">
                              <tr>
                                <th scope="col" style={{ width: "80px" }}>
                                  Image
                                </th>
                                <th scope="col">Product</th>
                                <th scope="col">Category</th>
                                <th scope="col" className="text-end">
                                  Price
                                </th>
                                <th scope="col" className="text-center">
                                  Qty
                                </th>
                                <th scope="col" className="text-end">
                                  Total
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.products.map((item, idx) => (
                                <tr key={idx}>
                                  <td>
                                    <img
                                      src={item.image || c5}
                                      alt={item.name}
                                      className="img-thumbnail"
                                      style={{
                                        width: "60px",
                                        height: "60px",
                                        objectFit: "cover",
                                      }}
                                    />
                                  </td>
                                  <td className="align-middle">{item.name}</td>
                                  <td className="align-middle">
                                    {item.category}
                                  </td>
                                  <td className="align-middle text-end">
                                    ₹{item.price.toFixed(2)}
                                  </td>
                                  <td className="align-middle text-center">
                                    {item.quantity}
                                  </td>
                                  <td className="align-middle text-end">
                                    ₹{(item.price * item.quantity).toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="table-light">
                              <tr>
                                <td colSpan="5" className="text-end fw-bold">
                                  Order Total:
                                </td>
                                <td className="text-end fw-bold">
                                  ₹{order.totalAmount.toFixed(2)}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                        <div className="d-flex justify-content-end gap-2 p-3 bg-light">
                          <Link
                            to={`/order/${order.id}`}
                            className="btn btn-sm btn-primary"
                          >
                            View Details
                          </Link>
                          <button className="btn btn-sm btn-outline-secondary">
                            <i className="bi bi-file-earmark-text me-1"></i>{" "}
                            Invoice
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default OrderHistory;
