import React, { Component } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
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
    if (orderId) {
      this.setState({ orderId }, () => {
        this.fetchOrderDetails(orderId);
      });
    } else {
      this.setState({
        errors: { fetchError: "Order ID is missing from URL" },
        isLoading: false,
      });
    }
  }

  fetchOrderDetails = async (orderId) => {
    try {
      console.log("Fetching order:", orderId);
      if (!orderId) {
        throw new Error("Order ID is missing");
      }

      // Make sure your backend API route matches this URL
      const response = await axios.get(
        `http://localhost:5000/api/OrderModel/${orderId}`
      );
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
        } else if (error.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = error.response.data.message || error.message;
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message;
      }

      this.setState({
        errors: { fetchError: errorMessage },
        isLoading: false,
      });
    }
  };

  handlePayment = async () => {
    try {
      const { netPayable, orderDetails } = this.state;
      const { navigate } = this.props;

      // Create order on backend
      const response = await axios.post(
        "http://localhost:5000/api/payment/create-order",
        {
          amount: netPayable,
          currency: "INR",
          receipt: orderDetails._id,
        }
      );

      const { order } = response.data;

      const options = {
        key: "rzp_test_yCgrsfXSuM7SxL",
        amount: order.amount,
        currency: order.currency,
        name: "Jewellery Shop",
        description: "Order Payment",
        order_id: order.id,
        handler: async (response) => {
          try {
            // Send payment verification data to server
            const verificationResponse = await axios.post(
              "http://localhost:5000/api/payment/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                receipt: orderDetails._id, // Pass the order ID as receipt
              }
            );

            if (verificationResponse.data.success) {
              alert(
                "Payment successful! Your order status has been updated to delivered."
              );
              // Redirect to order history page
              navigate("/OrderHistory");
            } else { 
              alert("Payment verification failed. Please contact support.");
            }
          } catch (error) {
            console.error("Payment verification failed:", error);
            alert(
              "Payment verification failed. Please try again or contact support."
            );
          }
        },
        prefill: {
          name: orderDetails.shippingAddress.name,
          email: orderDetails.shippingAddress.email,
          contact: orderDetails.shippingAddress.phone,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  render() {
    const { orderDetails, isLoading, errors, netPayable } = this.state;

    if (isLoading) {
      return (
        <div className="container mt-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading order details...</span>
          </div>
          <p className="mt-2">Loading order details...</p>
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
              <b>
                <h6>Shipping Address</h6>
              </b>
              <p>
                {orderDetails.shippingAddress.address} {" | "}
                {orderDetails.shippingAddress.city},{" "}
                {orderDetails.shippingAddress.state} -{" "}
                {orderDetails.shippingAddress.zipCode}
              </p>
              <p>
                Email: {orderDetails.shippingAddress.email} {" | "}Phone:{" "}
                {orderDetails.shippingAddress.phone}
              </p>
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

          <button
            className="btn btn-success w-100"
            onClick={this.handlePayment}
          >
            Proceed to Payment
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

function Checkout(props) {
  const params = useParams();
  const navigate = useNavigate();
  return <CheckOut {...props} params={params} navigate={navigate} />;
}

export default Checkout;
