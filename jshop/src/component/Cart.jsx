import React, { Component } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../App.css";
import { FaShoppingCart } from "react-icons/fa";

export class Cart extends Component {
  constructor() {
    super();
    this.state = {
      cartItems: [],
      isLoading: true,
      error: null,
      offerCode: "",
      offerError: "",
      discount: 0,
      appliedOffer: null, // Store details of the applied offer
      showCheckoutForm: false,
      userData: null,
    };
  }
  componentDidMount() {
    this.fetchCartItems();
    this.fetchUserData();
  }

  fetchUserData = async () => {
    try {
      const userData =
        localStorage.getItem("user") || localStorage.getItem("admin");

      if (!userData) {
        return;
      }

      const user = JSON.parse(userData);
      const userId = user.id;

      const response = await axios.get(
        `http://localhost:5000/api/Login/user-details/${userId}`
      );

      console.log("User data fetched:", response.data);

      this.setState({
        userData: response.data,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  fetchCartItems = async () => {
    try {
      const userData =
        localStorage.getItem("user") || localStorage.getItem("admin");

      if (!userData) {
        this.setState({
          error: "Please login to view your cart",
          isLoading: false,
        });
        return;
      }
      const user = JSON.parse(userData);
      const userId = user.id;

      console.log("Fetching cart for user ID:", userId);

      const response = await axios.get(
        `http://localhost:5000/api/CartModel/${userId}`
      );

      console.log("Cart response:", response.data);

      this.setState({
        cartItems: response.data,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching cart items:", error);
      this.setState({
        error:
          "Failed to load cart items: " +
          (error.response?.data?.error || error.message),
        isLoading: false,
      });
    }
  };

  removeFromCart = async (cartItemId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/CartModel/remove/${cartItemId}`
      );
      this.fetchCartItems();
    } catch (error) {
      console.error("Error removing item from cart:", error);
      alert(
        "Failed to remove item from cart: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await axios.put(
        `http://localhost:5000/api/CartModel/update/${cartItemId}`,
        {
          quantity: newQuantity,
        }
      );
      this.fetchCartItems();
    } catch (error) {
      console.error("Error updating cart quantity:", error);
      alert(
        "Failed to update quantity: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  calculateSubtotal = () => {
    return this.state.cartItems
      .reduce((total, item) => {
        const price = item.productId ? item.productId.price : 0;
        return total + price * item.quantity;
      }, 0)
      .toFixed(2);
  };

  calculateTotal = () => {
    const subtotal = parseFloat(this.calculateSubtotal());
    return (subtotal - this.state.discount).toFixed(2);
  };
  handleOfferCodeChange = (e) => {
    this.setState({ offerCode: e.target.value, offerError: "" });
  };

  applyDiscount = async () => {
    const { offerCode, cartItems } = this.state;

    if (!offerCode) {
      this.setState({ offerError: "Please enter an offer code" });
      return;
    }

    try {
      const subtotal = this.calculateSubtotal();
      const response = await axios.post(
        "http://localhost:5000/api/OfferModel/verify",
        {
          offerCode: offerCode.replace(/\s+/g, "").toUpperCase(), // Normalize code to match OfferBanner and backend
          cartTotal: subtotal,
        }
      );

      if (response.data.success) {
        this.setState({
          discount: parseFloat(response.data.discountAmount),
          appliedOffer: {
            title: response.data.offer.title,
            rate: response.data.offer.rate,
            maxDiscount: response.data.offer.maxdiscount,
          },
          offerError: "",
        });
      } else {
        this.setState({
          discount: 0,
          appliedOffer: null,
          offerError: response.data.message,
        });
      }
    } catch (error) {
      console.error("Error verifying offer code:", error);
      this.setState({
        discount: 0,
        appliedOffer: null,
        offerError:
          error.response?.data?.message || "Failed to verify offer code",
      });
    }
  };

  proceedToCheckout = () => {
    this.setState({ showCheckoutForm: true });
  };
  render() {
    const {
      cartItems,
      isLoading,
      error,
      offerCode,
      offerError,
      discount,
      appliedOffer,
      showCheckoutForm,
      userData,
    } = this.state;

    if (isLoading) {
      return (
        <div className="container mt-5 text-center">Loading your cart...</div>
      );
    }

    if (error) {
      return (
        <div className="container mt-5 text-center">
          <p className="text-danger">{error}</p>
          <Link to="/login" className="btn btn-primary">
            Go to Login
          </Link>
        </div>
      );
    }

    if (cartItems.length === 0) {
      return (
        <div className="container mt-5 text-center">
          <h2>Your Cart is Empty</h2>
          <Link to="/" className="btn btn-primary mt-3">
            Continue Shopping
          </Link>
        </div>
      );
    }

    if (showCheckoutForm) {
      return (
        <CheckoutForm
          subtotal={this.calculateSubtotal()}
          discount={this.state.discount}
          total={this.calculateTotal()}
          userData={this.state.userData}
          cartItems={this.state.cartItems} // Add this line
        />
      );
    }
    return (
      <div className="container mt-5">
        <h2 className="mb-4">
          <FaShoppingCart className="me-2 text-primary" /> Your Shopping Cart
        </h2>
        <div className="row">
          <div className="col-md-8">
            {cartItems.map((item) => (
              <div className="card mb-3" key={item._id}>
                <div className="row g-0">
                  <div className="col-md-3">
                    <img
                      src={
                        item.productId && item.productId.productImage
                          ? `http://localhost:5000/public/images/product_images/${item.productId.productImage}`
                          : require("./images/pro1.png")
                      }
                      alt={
                        item.productId ? item.productId.productName : "Product"
                      }
                      className="img-fluid rounded-start"
                      style={{ maxHeight: "150px", objectFit: "contain" }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = require("./images/pro1.png");
                      }}
                    />
                  </div>
                  <div className="col-md-9">
                    <div className="card-body">
                      <h5 className="card-title">
                        {item.productId
                          ? item.productId.productName
                          : "Unknown Product"}
                      </h5>
                      <p className="card-text">
                        Price: ₹{item.productId ? item.productId.price : 0}
                      </p>
                      <div className="d-flex align-items-center">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() =>
                            this.updateQuantity(item._id, item.quantity - 1)
                          }
                        >
                          -
                        </button>
                        <span className="mx-2">{item.quantity}</span>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() =>
                            this.updateQuantity(item._id, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                        <button
                          className="btn btn-sm btn-danger ms-3"
                          onClick={() => this.removeFromCart(item._id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Offer Code</h5>
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className={`form-control ${offerError ? "is-invalid" : ""}`}
                    placeholder="Enter offer code"
                    value={offerCode}
                    onChange={this.handleOfferCodeChange}
                  />
                  <button
                    className="btn btn-dark"
                    type="button"
                    onClick={this.applyDiscount}
                  >
                    Apply
                  </button>
                </div>
                {offerError && (
                  <div className="text-danger mb-3">{offerError}</div>
                )}
                {discount > 0 && appliedOffer && (
                  <div className="alert alert-success">
                    {appliedOffer.rate}% OFF applied with code{" "}
                    {appliedOffer.title}! Discount: ₹{discount.toFixed(2)}
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                
                <h5 className="card-title">Order Summary</h5>
                <hr />
                <div className="d-flex justify-content-between">
                  <p>Subtotal:</p>
                  <p>₹{this.calculateSubtotal()}</p>
                </div>
                <div className="d-flex justify-content-between">
                  <p>Shipping:</p>
                  <p>Free</p>
                </div>
                {discount > 0 && (
                  <div className="d-flex justify-content-between text-danger">
                    <p>Discount:</p>
                    <p>-₹{discount.toFixed(2)}</p>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between fw-bold">
                  <p>Total:</p>
                  <p>₹{this.calculateTotal()}</p>
                </div>
                <button
                  className="btn btn-success w-100 mt-2"
                  onClick={this.proceedToCheckout}
                >
                  Proceed to Checkout
                </button>
                <Link
                  to="/Ct_product"
                  className="btn btn-outline-primary w-100 mt-2"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class CheckoutForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedAddress: "",
      errors: {},
      addresses: [],
      showAddressForm: false,
      newAddress: {
        label: "",
        email: props.userData?.email || "",
        phone: "",
        fullAddress: "",
        city: "",
        state: "",
        zipCode: "",
        isDefault: false,
      },
    };
  }

  componentDidMount() {
    const { userData } = this.props;

    // Initialize new address with user data if available
    if (userData) {
      this.setState((prevState) => ({
        newAddress: {
          ...prevState.newAddress,
          email: userData.email || "",
          phone: userData.phone || "",
        },
      }));
    }

    // Load addresses from localStorage
    this.loadAddresses();
  }

  loadAddresses = () => {
    try {
      const userData =
        localStorage.getItem("user") || localStorage.getItem("admin");
      if (!userData) return;

      const user = JSON.parse(userData);
      const userId = user.id;

      // Get addresses from localStorage using userId as key
      const storedAddresses = localStorage.getItem(`addresses_${userId}`);
      const addresses = storedAddresses ? JSON.parse(storedAddresses) : [];

      this.setState({
        addresses,
        // If there's a default address, select it
        selectedAddress:
          addresses.find((addr) => addr.isDefault)?.id ||
          addresses[0]?.id ||
          "",
      });
    } catch (error) {
      console.error("Error loading addresses:", error);
    }
  };

  saveAddress = () => {
    try {
      const { newAddress, addresses } = this.state;
      const userData =
        localStorage.getItem("user") || localStorage.getItem("admin");
      if (!userData) return;

      const user = JSON.parse(userData);
      const userId = user.id;

      // Validate form fields
      const addressErrors = {};
      if (!newAddress.label) addressErrors.label = "Label is required";
      if (!newAddress.email) addressErrors.email = "Email is required";
      if (!newAddress.phone) addressErrors.phone = "Phone number is required";
      else if (!/^\d{10}$/.test(newAddress.phone))
        addressErrors.phone = "Phone number must be 10 digits";
      if (!newAddress.fullAddress)
        addressErrors.fullAddress = "Address is required";
      if (!newAddress.city) addressErrors.city = "City is required";
      if (!newAddress.state) addressErrors.state = "State is required";
      if (!newAddress.zipCode) addressErrors.zipCode = "ZIP code is required";
      else if (!/^\d{6}$/.test(newAddress.zipCode))
        addressErrors.zipCode = "ZIP code must be 6 digits";

      if (Object.keys(addressErrors).length > 0) {
        this.setState({ addressErrors });
        return;
      }

      // Create new address with id
      const addressToSave = {
        ...newAddress,
        id: Date.now().toString(),
      };

      // If it's the first address or marked as default, set as default
      if (addresses.length === 0 || addressToSave.isDefault) {
        // Update all other addresses to not be default
        const updatedAddresses = addresses.map((addr) => ({
          ...addr,
          isDefault: false,
        }));

        // Add the new address
        updatedAddresses.push(addressToSave);
        localStorage.setItem(
          `addresses_${userId}`,
          JSON.stringify(updatedAddresses)
        );

        this.setState({
          addresses: updatedAddresses,
          selectedAddress: addressToSave.id,
          showAddressForm: false,
          newAddress: {
            label: "",
            email: this.props.userData?.email || "",
            phone: "",
            fullAddress: "",
            city: "",
            state: "",
            zipCode: "",
            isDefault: false,
          },
          addressErrors: {},
        });
      } else {
        // Just add the new address
        const updatedAddresses = [...addresses, addressToSave];
        localStorage.setItem(
          `addresses_${userId}`,
          JSON.stringify(updatedAddresses)
        );

        this.setState({
          addresses: updatedAddresses,
          selectedAddress: addressToSave.id,
          showAddressForm: false,
          newAddress: {
            label: "",
            email: this.props.userData?.email || "",
            phone: "",
            fullAddress: "",
            city: "",
            state: "",
            zipCode: "",
            isDefault: false,
          },
          addressErrors: {},
        });
      }
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };

  removeAddress = (addressId) => {
    try {
      const { addresses } = this.state;
      const userData =
        localStorage.getItem("user") || localStorage.getItem("admin");
      if (!userData) return;

      const user = JSON.parse(userData);
      const userId = user.id;

      // Filter out the address to remove
      const updatedAddresses = addresses.filter(
        (addr) => addr.id !== addressId
      );

      // If we're removing the selected address, select another one if available
      let selectedAddress = this.state.selectedAddress;
      if (selectedAddress === addressId) {
        selectedAddress =
          updatedAddresses.find((addr) => addr.isDefault)?.id ||
          updatedAddresses[0]?.id ||
          "";
      }

      localStorage.setItem(
        `addresses_${userId}`,
        JSON.stringify(updatedAddresses)
      );

      this.setState({
        addresses: updatedAddresses,
        selectedAddress,
      });
    } catch (error) {
      console.error("Error removing address:", error);
    }
  };

  handleAddressChange = (e) => {
    this.setState({ selectedAddress: e.target.value });
  };

  handleNewAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    this.setState((prevState) => ({
      newAddress: {
        ...prevState.newAddress,
        [name]: type === "checkbox" ? checked : value,
      },
      addressErrors: {
        ...prevState.addressErrors,
        [name]: null,
      },
    }));
  };

  validateForm = () => {
    let newErrors = {};

    if (!this.state.selectedAddress && this.state.addresses.length > 0)
      newErrors.address = "Please select an address";
    else if (this.state.addresses.length === 0)
      newErrors.address = "Please add at least one shipping address";

    this.setState({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  };

  handleCheckout = async () => {
    if (this.validateForm()) {
      try {
        const userData = localStorage.getItem('user') || localStorage.getItem('admin');
        if (!userData) {
          alert('Please login to proceed with checkout');
          return;
        }
  
        const user = JSON.parse(userData);
        const userId = user.id;
  
        // Find the selected address
        const selectedAddress = this.state.addresses.find(
          (addr) => addr.id === this.state.selectedAddress
        );
  
        if (!selectedAddress) {
          this.setState({
            errors: { address: 'Please select a shipping address' },
          });
          return;
        }
  
        // Prepare cart items
        const cartItems = this.props.cartItems.map((item) => {
          if (!item.productId?._id) {
            throw new Error(
              `Invalid product ID for item: ${item.productId?.productName || 'Unknown'}`
            );
          }
          return {
            productId: item.productId._id,
            quantity: item.quantity,
            price: item.productId.price,
          };
        });
  
        // Prepare order data
        const orderData = {
          userId,
          items: cartItems,
          shippingAddress: {
            email: selectedAddress.email || user.email || '',
            phone: selectedAddress.phone || user.phone || '',
            address: selectedAddress.fullAddress || '',
            city: selectedAddress.city || '',
            state: selectedAddress.state || '',
            zipCode: selectedAddress.zipCode || '',
          },
          subtotal: parseFloat(this.props.subtotal) || 0,
          discount: parseFloat(this.props.discount || 0),
          total: parseFloat(this.props.total) || 0,
          offerName: this.props.appliedOffer?.title || '',
        };
  
        // Log orderData for debugging
        console.log('Sending order data:', JSON.stringify(orderData, null, 2));
  
        this.setState({ isProcessing: true });
  
        // Create order
        const response = await axios.post('http://localhost:5000/api/OrderModel/create', orderData);
  
        if (!response.data.success) {
          throw new Error(response.data.message || 'Order creation failed');
        }
  
        // Clear the cart after successful order creation
        await axios.delete(`http://localhost:5000/api/CartModel/clear/${userId}`);
  
        // Redirect to checkout page with order ID
        window.location.href = `/Checkout/${response.data.order._id}`;
      } catch (error) {
        console.error('Error creating order:', {
          message: error.message,
          response: error.response?.data,
        });
        this.setState({ isProcessing: false });
        alert(
          `Failed to place order: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    }
  };
  toggleAddressForm = () => {
    this.setState((prevState) => ({
      showAddressForm: !prevState.showAddressForm,
    }));
  };

  render() {
    const { subtotal, discount, total } = this.props;
    const {
      errors,
      addresses,
      selectedAddress,
      showAddressForm,
      newAddress,
      addressErrors,
    } = this.state;

    return (
      <div className="container mt-5">
        <h2 className="mb-4">Checkout</h2>
        <div className="row">
          <div className="col-md-8">
            <div className="card mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">Shipping Address</h5>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={this.toggleAddressForm}
                  >
                    {showAddressForm ? "Cancel" : "Add New Address"}
                  </button>
                </div>

                {/* New Address Form */}
                {showAddressForm && (
                  <div className="border p-3 mb-3 rounded">
                    <h6 className="mb-3">Add New Address</h6>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Address Label</label>
                        <input
                          type="text"
                          className={`form-control ${
                            addressErrors?.label ? "is-invalid" : ""
                          }`}
                          name="label"
                          value={newAddress.label}
                          onChange={this.handleNewAddressChange}
                          placeholder="Home, Work, etc."
                        />
                        {addressErrors?.label && (
                          <div className="invalid-feedback">
                            {addressErrors.label}
                          </div>
                        )}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Email</label>
                        <input
                          readOnly
                          type="email"
                          className={`form-control ${
                            addressErrors?.email ? "is-invalid" : ""
                          }`}
                          name="email"
                          value={newAddress.email}
                          onChange={this.handleNewAddressChange}
                          placeholder="Enter your email"
                        />
                        {addressErrors?.email && (
                          <div className="invalid-feedback">
                            {addressErrors.email}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Phone Number</label>
                        <input
                          type="text"
                          className={`form-control ${
                            addressErrors?.phone ? "is-invalid" : ""
                          }`}
                          name="phone"
                          value={newAddress.phone}
                          onChange={this.handleNewAddressChange}
                          placeholder="Enter 10-digit phone number"
                        />
                        {addressErrors?.phone && (
                          <div className="invalid-feedback">
                            {addressErrors.phone}
                          </div>
                        )}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">State</label>
                        <input
                          type="text"
                          className={`form-control ${
                            addressErrors?.state ? "is-invalid" : ""
                          }`}
                          name="state"
                          value={newAddress.state}
                          onChange={this.handleNewAddressChange}
                          placeholder="State"
                        />
                        {addressErrors?.state && (
                          <div className="invalid-feedback">
                            {addressErrors.state}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Full Address</label>
                      <textarea
                        className={`form-control ${
                          addressErrors?.fullAddress ? "is-invalid" : ""
                        }`}
                        name="fullAddress"
                        value={newAddress.fullAddress}
                        onChange={this.handleNewAddressChange}
                        placeholder="Enter full address with street, building, etc."
                        rows="2"
                      />
                      {addressErrors?.fullAddress && (
                        <div className="invalid-feedback">
                          {addressErrors.fullAddress}
                        </div>
                      )}
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">City</label>
                        <input
                          type="text"
                          className={`form-control ${
                            addressErrors?.city ? "is-invalid" : ""
                          }`}
                          name="city"
                          value={newAddress.city}
                          onChange={this.handleNewAddressChange}
                          placeholder="City"
                        />
                        {addressErrors?.city && (
                          <div className="invalid-feedback">
                            {addressErrors.city}
                          </div>
                        )}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">ZIP Code</label>
                        <input
                          type="text"
                          className={`form-control ${
                            addressErrors?.zipCode ? "is-invalid" : ""
                          }`}
                          name="zipCode"
                          value={newAddress.zipCode}
                          onChange={this.handleNewAddressChange}
                          placeholder="Enter 6-digit ZIP code"
                        />
                        {addressErrors?.zipCode && (
                          <div className="invalid-feedback">
                            {addressErrors.zipCode}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mb-3 form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="defaultAddress"
                        name="isDefault"
                        checked={newAddress.isDefault}
                        onChange={this.handleNewAddressChange}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="defaultAddress"
                      >
                        Set as default address
                      </label>
                    </div>
                    <button
                      className="btn btn-success"
                      onClick={this.saveAddress}
                    >
                      Save Address
                    </button>
                  </div>
                )}

                {/* Existing Addresses */}
                {addresses.length > 0 ? (
                  <div className="mb-3">
                    {errors.address && (
                      <div className="alert alert-danger">{errors.address}</div>
                    )}
                    {addresses.map((address) => (
                      <div key={address.id} className="card mb-2">
                        <div className="card-body p-3">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="shippingAddress"
                              id={`address-${address.id}`}
                              value={address.id}
                              checked={selectedAddress === address.id}
                              onChange={this.handleAddressChange}
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`address-${address.id}`}
                            >
                              <strong>{address.label}</strong>{" "}
                              {address.isDefault && (
                                <span className="badge bg-primary">
                                  Default
                                </span>
                              )}
                              <div className="mt-1">
                                <p className="mb-0">
                                  <i className="bi bi-envelope"></i>{" "}
                                  {address.email}
                                </p>
                                <p className="mb-0">
                                  <i className="bi bi-telephone"></i>{" "}
                                  {address.phone}
                                </p>
                                <p className="mb-0 mt-1">
                                  {address.fullAddress}
                                </p>
                                <p className="mb-0">
                                  {address.city}, {address.state} -{" "}
                                  {address.zipCode}
                                </p>
                              </div>
                            </label>
                          </div>
                          <button
                            className="btn btn-sm btn-outline-danger mt-2"
                            onClick={() => this.removeAddress(address.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="alert alert-warning">
                    No saved addresses. Please add a shipping address.
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Order Summary</h5>
                <hr />
                <div className="d-flex justify-content-between">
                  <p>Subtotal:</p>
                  <p>₹{subtotal}</p>
                </div>
                <div className="d-flex justify-content-between">
                  <p>Shipping:</p>
                  <p>Free</p>
                </div>
                {discount > 0 && (
                  <div className="d-flex justify-content-between text-success">
                    <p>Discount:</p>
                    <p>-₹{discount.toFixed(2)}</p>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between fw-bold">
                  <p>Total:</p>
                  <p>₹{total}</p>
                </div>
                <button
                  className="btn btn-success w-100 mt-2"
                  onClick={this.handleCheckout}
                >
                  Place Order
                </button>
                <button
                  className="btn btn-outline-secondary w-100 mt-2"
                  onClick={() => {
                    window.location.href = "/cart";
                  }}
                >
                  Back to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Cart;
