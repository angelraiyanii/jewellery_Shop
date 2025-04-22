import React, { Component } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

class CheckOut extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orderId: "",
      orderDetails: null,
      netPayable: "",
      errors: {},
      isLoading: true,
    };
  }

  componentDidMount() {
    const { orderId } = this.props.params;
    this.setState({ orderId }, () => {
      this.fetchOrderDetails(orderId);
    });
  }

  fetchOrderDetails = async (orderId) => {
    try {
      console.log("Fetching order:", orderId);
      if (!orderId) {
        throw new Error("Order ID is missing");
      }

      const response = await axios.get(`http://localhost:5000/api/OrderModel/${orderId}`);
      console.log("Order response:", response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Invalid order response");
      }

      this.setState({
        orderDetails: response.data.order,
        netPayable: response.data.order.total.toFixed(2),
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching order details:", error);
      let errorMessage = "Failed to load order details";
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = "Invalid order ID format";
        } else if (error.response.status === 404) {
          errorMessage = "Order not found";
        } else {
          errorMessage = error.response.data.message || error.message;
        }
      } else {
        errorMessage = error.message;
      }
      this.setState({
        errors: { fetchError: errorMessage },
        isLoading: false,
      });
    }
  };

  render() {
    const { orderDetails, isLoading, errors, netPayable } = this.state;

    if (isLoading) {
      return (
        <div className="container mt-5 text-center">
          Loading order details...
        </div>
      );
    }

    if (errors.fetchError) {
      return (
        <div className="container mt-5 text-center">
          <div className="alert alert-danger">{errors.fetchError}</div>
          <button
            className="btn btn-secondary me-2"
            onClick={() => this.fetchOrderDetails(this.state.orderId)}
          >
            Retry
          </button>
          <Link to="/" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      );
    }

    return (
      <div className="container mt-5 d-flex justify-content-center">
        <div className="card shadow p-4" style={{ width: "500px" }}>
          <h2 className="text-center mb-4">Order Confirmation</h2>

          {orderDetails && (
            <div className="mb-4">
              <h5>Order Summary</h5>
              <hr />
              <div className="d-flex justify-content-between">
                <p>Order ID:</p>
                <p>{orderDetails._id}</p>
              </div>
              <div className="d-flex justify-content-between">
                <p>Date:</p>
                <p>{new Date(orderDetails.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="d-flex justify-content-between">
                <p>Items:</p>
                <p>{orderDetails.items.length}</p>
              </div>
              {orderDetails.discount > 0 && (
                <div className="d-flex justify-content-between text-success">
                  <p>Discount:</p>
                  <p>-₹{orderDetails.discount.toFixed(2)}</p>
                </div>
              )}
              <div className="d-flex justify-content-between fw-bold">
                <p>Total Amount:</p>
                <p>₹{orderDetails.total.toFixed(2)}</p>
              </div>
              <hr />
              <h6>Shipping Address</h6>
              <p>{orderDetails.shippingAddress.address}</p>
              <p>
                {orderDetails.shippingAddress.city},{" "}
                {orderDetails.shippingAddress.state} -{" "}
                {orderDetails.shippingAddress.zipCode}
              </p>
              <p>Email: {orderDetails.shippingAddress.email}</p>
              <p>Phone: {orderDetails.shippingAddress.phone}</p>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Payable Amount:</label>
            <input
              type="text"
              className="form-control"
              value={netPayable}
              readOnly
            />
          </div>

          <button className="btn btn-success w-100" disabled>
            Payment Processing
          </button>

          <div className="mt-3 text-center">
            <Link to="/" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

function CheckOutWithParams(props) {
  const params = useParams();
  return <CheckOut {...props} params={params} />;
}

export default CheckOutWithParams;