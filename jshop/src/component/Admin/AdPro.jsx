import { useState, useEffect } from "react";
import axios from "axios";
import c1 from "../images/category1.png";

const AdPro = () => {
  const [formData, setFormData] = useState({
    productName: "",
    categoryName: "",
    price: "",
    discount: "",
    goldWeight: "",
    diamondWeight: "",
    grossWeight: "",
    goldPrice: "",
    diamondPrice: "",
    makingCharges: "",
    overheadCharges: "",
    basePrice: "",
    tax: "",
    totalPrice: "",
    productType: "",
    productPurity: "",
    diamondColor: "",
    diamondPieces: "",
    stock: "",
    quantity: "",
    productImage: null,
    searchQuery: "",
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showProductView, setShowProductView] = useState(true);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [viewSingleProduct, setViewSingleProduct] = useState(null);
  const [updateProductId, setUpdateProductId] = useState(null);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/CategoryModel/categories"
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setErrors({ fetch: "Failed to fetch categories" });
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/ProductModel/products" // Fixed endpoint
        );
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchCategories();
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, productImage: file });
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    if (file) reader.readAsDataURL(file);
  };

  const validateForm = (data) => {
    let newErrors = {};
    Object.keys(data).forEach((key) => {
      if (key !== "productImage" && !data[key]) {
        newErrors[key] = "This field is required";
      }
    });
    if (!data.productImage)
      newErrors.productImage = "Product image is required";
    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) return;

    const formDataObj = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataObj.append(key, formData[key]);
    });

    for (let pair of formDataObj.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/ProductModel/add-product",
        formDataObj,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setProducts([...products, response.data.product]);
      alert("Product added successfully!");
      resetForm();
    } catch (error) {
      console.error(
        "Error adding product:",
        error.response?.data || error.message
      );
      alert(error.response?.data?.error || "Something went wrong");
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    const formDataObj = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== "" && formData[key] !== null) {
        formDataObj.append(key, formData[key]);
      }
    });

    try {
      const response = await axios.put(
        `http://localhost:5000/api/ProductModel/update-product/${updateProductId}`,
        formDataObj,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setProducts(
        products.map((p) => (p._id === updateProductId ? response.data : p))
      );
      alert("Product updated successfully!");
      resetForm();
      setShowUpdateForm(false);
      setShowProductView(true);
    } catch (error) {
      console.error(
        "Error updating product:",
        error.response?.data || error.message
      );
      alert(error.response?.data?.error || "Something went wrong");
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await axios.delete(
        `http://localhost:5000/api/ProductModel/delete-product/${id}`
      );
      setProducts(products.filter((p) => p._id !== id));
      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert(
        "Failed to delete product: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const resetForm = () => {
    setFormData({
      productName: "",
      categoryName: "",
      price: "",
      discount: "",
      goldWeight: "",
      diamondWeight: "",
      grossWeight: "",
      goldPrice: "",
      diamondPrice: "",
      makingCharges: "",
      overheadCharges: "",
      basePrice: "",
      tax: "",
      totalPrice: "",
      productType: "",
      productPurity: "",
      diamondColor: "",
      diamondPieces: "",
      stock: "",
      quantity: "",
      productImage: null,
    });
    setImagePreview(null);
    setErrors({});
  };

  const toggleAddProductForm = () => {
    setShowProductForm(true);
    setShowProductView(false);
    setShowUpdateForm(false);
    setViewSingleProduct(null);
  };

  const toggleUpdateProductForm = (product) => {
    console.log("Toggling Update Product Form", product);
    setFormData({ ...product, productImage: null });
    setUpdateProductId(product._id);
    setShowUpdateForm(true);
    setShowProductForm(false);
    setShowProductView(false);
    setViewSingleProduct(null);
    if (product.productImage) {
      setImagePreview(
        `http://localhost:5000/public/images/product_images/${product.productImage}`
      );
    }
  };
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const filteredProducts = products.filter((product) =>
    product.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleViewSingleProduct = (product) => {
    setViewSingleProduct(product);
    setShowProductView(true);
    setShowProductForm(false);
    setShowUpdateForm(false);
  };
 

  return (
    <center>
      <div className="container ">
        <h2 className="text-center mb-4">Product View</h2>
        <div className="d-flex justify-content-between mb-3">
          <div className="d-flex">
            <input
              type="text"
              className="form-control"
              placeholder="🔎Search categories..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <button className="btn btn-success" onClick={toggleAddProductForm}>
            Add Product
          </button>
        </div>

        {/* Add Product Form */}
        {showProductForm && (
          <div className="p-4 d-flex justify-content-center align-items-center">
            <section className="container">
              <div className="row justify-content-center">
                <div className="col-lg-8 col-md-10">
                  <div
                    className="card shadow-lg"
                    style={{ borderRadius: "15px" }}
                  >
                    <div className="card-body">
                      <h1 className="text-black text-center mb-4">
                        Add Product
                      </h1>
                      {errors.fetch && (
                        <p className="text-danger text-center">
                          {errors.fetch}
                        </p>
                      )}
                      <form onSubmit={handleSubmit}>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Product Name</label>
                            <input
                              type="text"
                              name="productName"
                              className={`form-control ${
                                errors.productName ? "is-invalid" : ""
                              }`}
                              value={formData.productName}
                              onChange={handleChange}
                            />
                            <div className="invalid-feedback">
                              {errors.productName}
                            </div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Category Name</label>
                            <select
                              name="categoryName"
                              className={`form-control ${
                                errors.categoryName ? "is-invalid" : ""
                              }`}
                              value={formData.categoryName}
                              onChange={handleChange}
                            >
                              <option value="">Select Category</option>
                              {categories.map((category) => (
                                <option
                                  key={category._id}
                                  value={category.categoryName}
                                >
                                  {category.categoryName}
                                </option>
                              ))}
                            </select>
                            <div className="invalid-feedback">
                              {errors.categoryName}
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Price (Rs.)</label>
                            <input
                              type="text"
                              name="price"
                              placeholder="00.00"
                              className={`form-control ${
                                errors.price ? "is-invalid" : ""
                              }`}
                              value={formData.price}
                              onChange={handleChange}
                            />
                            <div className="invalid-feedback">
                              {errors.price}
                            </div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Discount</label>
                            <input
                              type="text"
                              name="discount"
                              placeholder="00.0 % off"
                              className={`form-control ${
                                errors.discount ? "is-invalid" : ""
                              }`}
                              value={formData.discount}
                              onChange={handleChange}
                            />
                            <div className="invalid-feedback">
                              {errors.discount}
                            </div>
                          </div>
                        </div>
                        <hr />
                        <h5>Weight Details</h5>
                        <div className="row">
                          <div className="col-md-4 mb-3">
                            <label className="form-label">
                              Gold Weight (Gram)
                            </label>
                            <input
                              type="text"
                              name="goldWeight"
                              placeholder="0.00"
                              className={`form-control ${
                                errors.goldWeight ? "is-invalid" : ""
                              }`}
                              value={formData.goldWeight}
                              onChange={handleChange}
                            />
                            <div className="invalid-feedback">
                              {errors.goldWeight}
                            </div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="form-label">
                              Diamond Weight (Gram)
                            </label>
                            <input
                              type="text"
                              name="diamondWeight"
                              placeholder="0.00"
                              className={`form-control ${
                                errors.diamondWeight ? "is-invalid" : ""
                              }`}
                              value={formData.diamondWeight}
                              onChange={handleChange}
                            />
                            <div className="invalid-feedback">
                              {errors.diamondWeight}
                            </div>
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="form-label">
                              Gross Weight (Gram)
                            </label>
                            <input
                              type="text"
                              name="grossWeight"
                              placeholder="0.00"
                              className={`form-control ${
                                errors.grossWeight ? "is-invalid" : ""
                              }`}
                              value={formData.grossWeight}
                              onChange={handleChange}
                            />
                            <div className="invalid-feedback">
                              {errors.grossWeight}
                            </div>
                          </div>
                        </div>
                        <hr />
                        <h5>Price Details</h5>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              Gold Price (Rs.)
                            </label>
                            <input
                              type="text"
                              name="goldPrice"
                              placeholder="0000.00"
                              className={`form-control ${
                                errors.goldPrice ? "is-invalid" : ""
                              }`}
                              value={formData.goldPrice}
                              onChange={handleChange}
                            />
                            <div className="invalid-feedback">
                              {errors.goldPrice}
                            </div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              Diamond Price (Rs.)
                            </label>
                            <input
                              type="text"
                              name="diamondPrice"
                              placeholder="00.00"
                              className={`form-control ${
                                errors.diamondPrice ? "is-invalid" : ""
                              }`}
                              value={formData.diamondPrice}
                              onChange={handleChange}
                            />
                            <div className="invalid-feedback">
                              {errors.diamondPrice}
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              Making Charges (Rs.)
                            </label>
                            <input
                              type="text"
                              name="makingCharges"
                              placeholder="000.00"
                              className={`form-control ${
                                errors.makingCharges ? "is-invalid" : ""
                              }`}
                              value={formData.makingCharges}
                              onChange={handleChange}
                            />
                            <div className="invalid-feedback">
                              {errors.makingCharges}
                            </div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              Overhead Charges (Rs.)
                            </label>
                            <input
                              type="text"
                              name="overheadCharges"
                              placeholder="000"
                              className={`form-control ${
                                errors.overheadCharges ? "is-invalid" : ""
                              }`}
                              value={formData.overheadCharges}
                              onChange={handleChange}
                            />
                            <div className="invalid-feedback">
                              {errors.overheadCharges}
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              Base Price (Rs.)
                            </label>
                            <input
                              type="text"
                              name="basePrice"
                              placeholder="0000.00"
                              className={`form-control ${
                                errors.basePrice ? "is-invalid" : ""
                              }`}
                              value={formData.basePrice}
                              onChange={handleChange}
                            />
                            <div className="invalid-feedback">
                              {errors.basePrice}
                            </div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Tax (Rs.)</label>
                            <input
                              type="text"
                              name="tax"
                              placeholder="00.00"
                              className={`form-control ${
                                errors.tax ? "is-invalid" : ""
                              }`}
                              value={formData.tax}
                              onChange={handleChange}
                            />
                            <div className="invalid-feedback">{errors.tax}</div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-12 mb-3">
                            <label className="form-label">
                              Total Price (Rs.)
                            </label>
                            <input
                              type="text"
                              name="totalPrice"
                              placeholder="0000.00"
                              className={`form-control ${
                                errors.totalPrice ? "is-invalid" : ""
                              }`}
                              value={formData.totalPrice}
                              onChange={handleChange}
                            />
                            <div className="invalid-feedback">
                              {errors.totalPrice}
                            </div>
                          </div>
                        </div>
                        <hr />
                        <h5>Product Details</h5>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Product Type</label>
                            <input
                              type="text"
                              name="productType"
                              placeholder="Gold Type"
                              className={`form-control ${
                                errors.productType ? "is-invalid" : ""
                              }`}
                              value={formData.productType}
                              onChange={handleChange}
                            />
                            <div className="invalid-feedback">
                              {errors.productType}
                            </div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Product Purity</label>
                            <input
                              type="text"
                              name="productPurity"
                              placeholder="00K"
                              className={`form-control ${
                                errors.productPurity ? "is-invalid" : ""
                              }`}
                              value={formData.productPurity}
                              onChange={handleChange}
                            />
                            <div className="invalid-feedback">
                              {errors.productPurity}
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Diamond Color</label>
                            <input
                              type="text"
                              name="diamondColor"
                              placeholder="Color Of Diamond"
                              className={`form-control ${
                                errors.diamondColor ? "is-invalid" : ""
                              }`}
                              value={formData.diamondColor}
                              onChange={handleChange}
                            />
                            <div className="invalid-feedback">
                              {errors.diamondColor}
                            </div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Diamond Pieces</label>
                            <input
                              type="text"
                              name="diamondPieces"
                              placeholder="00.00"
                              className={`form-control ${
                                errors.diamondPieces ? "is-invalid" : ""
                              }`}
                              value={formData.diamondPieces}
                              onChange={handleChange}
                            />
                            <div className="invalid-feedback">
                              {errors.diamondPieces}
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Stock</label>
                            <input
                              type="text"
                              name="stock"
                              placeholder="00"
                              className={`form-control ${
                                errors.stock ? "is-invalid" : ""
                              }`}
                              value={formData.stock}
                              onChange={handleChange}
                            />
                            <div className="invalid-feedback">
                              {errors.stock}
                            </div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Quantity</label>
                            <input
                              type="number"
                              name="quantity"
                              placeholder="0"
                              className={`form-control ${
                                errors.quantity ? "is-invalid" : ""
                              }`}
                              value={formData.quantity}
                              onChange={handleChange}
                            />
                            <div className="invalid-feedback">
                              {errors.quantity}
                            </div>
                          </div>
                        </div>
                        <div className="row mb-4">
                          <div className="col-12">
                            <label className="form-label">Product Image</label>
                            <div className="d-flex gap-3 align-items-start">
                              <div className="flex-grow-1">
                                <input
                                  type="file"
                                  name="productImage"
                                  accept="image/png, image/jpeg, image/jpg"
                                  className={`form-control ${
                                    errors.productImage ? "is-invalid" : ""
                                  }`}
                                  onChange={handleFileChange}
                                />
                                <div className="invalid-feedback">
                                  {errors.productImage}
                                </div>
                                <small className="text-muted">
                                  Allowed formats: JPG, JPEG, PNG. Maximum size:
                                  5MB
                                </small>
                              </div>
                              {imagePreview && (
                                <div
                                  style={{ width: "100px", height: "100px" }}
                                >
                                  <img
                                    src={imagePreview}
                                    alt="Product preview"
                                    className="img-thumbnail"
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-center py-3">
                          <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                          >
                            Add Product
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
        {/* add product end */}
        {/* Update Product Form */}
        {showUpdateForm && (
          <div className="p-4 d-flex justify-content-center align-items-center">
            <section className="container">
              <div className="row justify-content-center">
                <div className="col-lg-8 col-md-10">
                  <div
                    className="card shadow-lg"
                    style={{ borderRadius: "15px" }}
                  >
                    <div className="card-body">
                      <h1 className="text-black text-center mb-4">
                        Update Product
                      </h1>
                      <form onSubmit={handleUpdateSubmit}>
                        {/* Basic Details */}
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Product Name</label>
                            <input
                              type="text"
                              name="productName"
                              className="form-control"
                              value={formData.productName}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Category Name</label>
                            <select
                              name="categoryName"
                              className="form-control"
                              value={formData.categoryName}
                              onChange={handleChange}
                            >
                              <option value="">Select Category</option>
                              {categories.map((category) => (
                                <option
                                  key={category._id}
                                  value={category.categoryName}
                                >
                                  {category.categoryName}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Price and Discount */}
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Price (Rs.)</label>
                            <input
                              type="text"
                              name="price"
                              placeholder="00.00"
                              className="form-control"
                              value={formData.price}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Discount</label>
                            <input
                              type="text"
                              name="discount"
                              placeholder="00.0 % off"
                              className="form-control"
                              value={formData.discount}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <hr />
                        {/* Weight Details */}
                        <h5>Weight Details</h5>
                        <div className="row">
                          <div className="col-md-4 mb-3">
                            <label className="form-label">
                              Gold Weight (Gram)
                            </label>
                            <input
                              type="text"
                              name="goldWeight"
                              placeholder="0.00"
                              className="form-control"
                              value={formData.goldWeight}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="form-label">
                              Diamond Weight (Gram)
                            </label>
                            <input
                              type="text"
                              name="diamondWeight"
                              placeholder="0.00"
                              className="form-control"
                              value={formData.diamondWeight}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="col-md-4 mb-3">
                            <label className="form-label">
                              Gross Weight (Gram)
                            </label>
                            <input
                              type="text"
                              name="grossWeight"
                              placeholder="0.00"
                              className="form-control"
                              value={formData.grossWeight}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <hr />
                        {/* Price Details */}
                        <h5>Price Details</h5>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              Gold Price (Rs.)
                            </label>
                            <input
                              type="text"
                              name="goldPrice"
                              placeholder="0000.00"
                              className="form-control"
                              value={formData.goldPrice}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              Diamond Price (Rs.)
                            </label>
                            <input
                              type="text"
                              name="diamondPrice"
                              placeholder="00.00"
                              className="form-control"
                              value={formData.diamondPrice}
                              onChange={handleChange}
                            />
                          </div>
                        </div>

                        {/* Charges */}
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              Making Charges (Rs.)
                            </label>
                            <input
                              type="text"
                              name="makingCharges"
                              placeholder="000.00"
                              className="form-control"
                              value={formData.makingCharges}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              Overhead Charges (Rs.)
                            </label>
                            <input
                              type="text"
                              name="overheadCharges"
                              placeholder="000"
                              className="form-control"
                              value={formData.overheadCharges}
                              onChange={handleChange}
                            />
                          </div>
                        </div>

                        {/* Base Price and Tax */}
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">
                              Base Price (Rs.)
                            </label>
                            <input
                              type="text"
                              name="basePrice"
                              placeholder="0000.00"
                              className="form-control"
                              value={formData.basePrice}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Tax (Rs.)</label>
                            <input
                              type="text"
                              name="tax"
                              placeholder="00.00"
                              className="form-control"
                              value={formData.tax}
                              onChange={handleChange}
                            />
                          </div>
                        </div>

                        {/* Total Price */}
                        <div className="row">
                          <div className="col-12 mb-3">
                            <label className="form-label">
                              Total Price (Rs.)
                            </label>
                            <input
                              type="text"
                              name="totalPrice"
                              placeholder="0000.00"
                              className="form-control"
                              value={formData.totalPrice}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <hr />
                        {/* Product Details */}
                        <h5>Product Details</h5>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Product Type</label>
                            <input
                              type="text"
                              name="productType"
                              placeholder="Gold Type"
                              className="form-control"
                              value={formData.productType}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Product Purity</label>
                            <input
                              type="text"
                              name="productPurity"
                              placeholder="00K"
                              className="form-control"
                              value={formData.productPurity} // Fixed typo here
                              onChange={handleChange}
                            />
                          </div>
                        </div>

                        {/* Diamond Details */}
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Diamond Color</label>
                            <input
                              type="text"
                              name="diamondColor"
                              placeholder="Color Of Diamond"
                              className="form-control"
                              value={formData.diamondColor}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Diamond Pieces</label>
                            <input
                              type="text"
                              name="diamondPieces"
                              placeholder="00.00"
                              className="form-control"
                              value={formData.diamondPieces}
                              onChange={handleChange}
                            />
                          </div>
                        </div>

                        {/* Stock and Quantity */}
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Stock</label>
                            <input
                              type="text"
                              name="stock"
                              placeholder="00"
                              className="form-control"
                              value={formData.stock}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Quantity</label>
                            <input
                              type="number"
                              name="quantity"
                              placeholder="0"
                              className="form-control"
                              value={formData.quantity}
                              onChange={handleChange}
                            />
                          </div>
                        </div>

                        <div className="row mb-4">
                          <div className="col-12">
                            <label className="form-label">Product Image</label>
                            <div className="d-flex gap-3 align-items-start">
                              <div className="flex-grow-1">
                                <input
                                  type="file"
                                  name="productImage"
                                  className="form-control"
                                  onChange={handleFileChange}
                                />
                                <small className="text-muted">
                                  Allowed formats: JPG, JPEG, PNG. Maximum size:
                                  5MB
                                </small>
                              </div>
                              {imagePreview && (
                                <div
                                  style={{ width: "100px", height: "100px" }}
                                >
                                  <img
                                    src={imagePreview}
                                    alt="Product preview"
                                    className="img-thumbnail"
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-center py-3">
                          <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                          >
                            Update Product
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Product View Table start */}
        {showProductView && (
          <div className="row mt-5">
            <div className="col-10 offset-1">
              <div className="table-responsive">
                <table className="table table-bordered text-center align-middle">
                  <thead className="table table-bordered">
                    <tr>
                      <th>Sr No</th>
                      <th>Product Image</th>
                      <th>Product Name</th>
                      <th>Total Price</th>
                      <th>Status</th>
                      <th>View</th>
                      <th>Update</th>
                      <th>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center text-muted">
                          No Product found.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product, index) => (
                        <>
                          <tr key={product._id}>
                            <td>{index + 1}</td>
                            <td>
                              <img
                                height={90}
                                width={90}
                                src={
                                  product.productImage
                                    ? `http://localhost:5000/public/images/product_images/${product.productImage}`
                                    : c1
                                }
                              />
                            </td>
                            <td>{product.productName}</td>
                            <td>₹ {product.totalPrice}</td>
                            <td className="text-success fw-bold">Active</td>
                            <td>
                              <button
                                className="btn btn-info fs-5"
                                onClick={() => toggleViewSingleProduct(product)}
                              >
                                View
                              </button>
                            </td>
                            <td>
                              <button
                                className="btn btn-success fs-5"
                                onClick={() => toggleUpdateProductForm(product)}
                              >
                                Update
                              </button>
                            </td>
                            <td>
                              <button
                                className="btn btn-danger fs-5"
                                onClick={() => handleDelete(product._id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                          {viewSingleProduct &&
                            viewSingleProduct._id === product._id && (
                              <tr>
                                <td colSpan="8">
                                  <div className="container">
                                    <div className="row align-items shadow rounded">
                                      <div className="col-md-4 text-center">
                                        <img
                                          src={
                                            product.productImage
                                              ? `http://localhost:5000/public/images/product_images/${product.productImage}`
                                              : c1
                                          }
                                          alt={viewSingleProduct.productName}
                                          className="img-fluid rounded"
                                          style={{
                                            height: "200px",
                                            objectFit: "cover",
                                          }}
                                        />
                                      </div>
                                      <div className="col-md-8">
                                        <div className="mt-5">
                                          <div className="product-details text-start">
                                            <h6
                                              className="fw-bold"
                                              style={{
                                                fontSize: "14px",
                                                color: "#41566E",
                                              }}
                                            >
                                              Product Details
                                            </h6>
                                            <hr />
                                            <tr>
                                              <th>
                                                <h4>
                                                  <strong>Name:</strong>{" "}
                                                  {
                                                    viewSingleProduct.productName
                                                  }
                                                </h4>
                                                <p className="text-muted">
                                                  {
                                                    viewSingleProduct.categoryName
                                                  }
                                                </p>
                                                <h4 style={{ color: "green" }}>
                                                  Discount:{" "}
                                                  {viewSingleProduct.discount}%
                                                  off
                                                </h4>
                                                <div className="d-flex align-items-center">
                                                  <h5 className="me-2">
                                                    Rs.{" "}
                                                    {viewSingleProduct.price}
                                                  </h5>
                                                </div>
                                              </th>
                                              <th className="ps-4 align-top">
                                                <div className="mt-4">
                                                  <h6
                                                    className="fw-bold"
                                                    style={{
                                                      fontSize: "12px",
                                                      color: "#41566E",
                                                    }}
                                                  >
                                                    Product Specifications
                                                  </h6>
                                                  <table
                                                    className="table table-borderless mb-0"
                                                    style={{ fontSize: "12px" }}
                                                  >
                                                    <tbody>
                                                      <tr>
                                                        <td className="fw-bold text-start">
                                                          Product type:
                                                        </td>
                                                        <td className="text-start">
                                                          {
                                                            viewSingleProduct.productType
                                                          }
                                                        </td>
                                                      </tr>
                                                      <tr>
                                                        <td className="fw-bold text-start">
                                                          Product purity:
                                                        </td>
                                                        <td className="text-start">
                                                          {
                                                            viewSingleProduct.purity
                                                          }
                                                        </td>
                                                      </tr>
                                                      <tr>
                                                        <td className="fw-bold text-start">
                                                          Diamond color:
                                                        </td>
                                                        <td className="text-start">
                                                          {
                                                            viewSingleProduct.diamondColor
                                                          }
                                                        </td>
                                                      </tr>
                                                      <tr>
                                                        <td className="fw-bold text-start">
                                                          Diamond pieces:
                                                        </td>
                                                        <td className="text-start">
                                                          {
                                                            viewSingleProduct.diamondPieces
                                                          }
                                                        </td>
                                                      </tr>
                                                      <tr>
                                                        <td className="fw-bold text-start">
                                                          Stock:
                                                        </td>
                                                        <td className="text-start">
                                                          {
                                                            viewSingleProduct.stock
                                                          }
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                                                </div>
                                              </th>
                                            </tr>

                                            {/* Weight Details */}
                                            <div className="mt-4">
                                              <h6
                                                className="fw-bold"
                                                style={{
                                                  fontSize: "12px",
                                                  color: "#41566E",
                                                }}
                                              >
                                                Weight Details
                                              </h6>
                                              <div className="table-responsive">
                                                <table className="table">
                                                  <thead>
                                                    <tr>
                                                      <th>Gold weight</th>
                                                      <th>Diamond weight</th>
                                                      <th>Gross weight</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    <tr>
                                                      <td>
                                                        {
                                                          viewSingleProduct.goldWeight
                                                        }
                                                      </td>
                                                      <td>
                                                        {
                                                          viewSingleProduct.diamondWeight
                                                        }
                                                      </td>
                                                      <td>
                                                        {
                                                          viewSingleProduct.grossWeight
                                                        }
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                              </div>
                                            </div>

                                            {/* Price Details */}
                                            <div className="mt-4">
                                              <h6
                                                className="fw-bold"
                                                style={{
                                                  fontSize: "12px",
                                                  color: "#41566E",
                                                }}
                                              >
                                                Price Details
                                              </h6>
                                              <div className="table-responsive">
                                                <table className="table">
                                                  <thead>
                                                    <tr>
                                                      <th>Gold price</th>
                                                      <th>Diamond price</th>
                                                      <th>Making charges</th>
                                                      <th>Overhead charges</th>
                                                      <th>Base price</th>
                                                      <th>Tax</th>
                                                      <th>Total price</th>
                                                    </tr>
                                                  </thead>
                                                  <tbody>
                                                    <tr>
                                                      <td>
                                                        ₹{" "}
                                                        {
                                                          viewSingleProduct.goldPrice
                                                        }
                                                      </td>
                                                      <td>
                                                        ₹{" "}
                                                        {
                                                          viewSingleProduct.diamondPrice
                                                        }
                                                      </td>
                                                      <td>
                                                        ₹{" "}
                                                        {
                                                          viewSingleProduct.makingCharges
                                                        }
                                                      </td>
                                                      <td>
                                                        ₹{" "}
                                                        {
                                                          viewSingleProduct.overheadCharges
                                                        }
                                                      </td>
                                                      <td>
                                                        ₹{" "}
                                                        {
                                                          viewSingleProduct.basePrice
                                                        }
                                                      </td>
                                                      <td>
                                                        ₹{" "}
                                                        {viewSingleProduct.tax}
                                                      </td>
                                                      <td>
                                                        ₹{" "}
                                                        {
                                                          viewSingleProduct.totalPrice
                                                        }
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                        </>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
              {/* Product View Table end */}
      </div>
    </center>
  );
};

export default AdPro;
