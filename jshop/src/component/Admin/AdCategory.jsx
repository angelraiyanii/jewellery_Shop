import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import React, { Component } from "react";
import c1 from "../images/category1.png";

export class AddCategory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      ShowCategoryView: true,
      showCategoryForm: false,
      UpdateCategoryForm: false,
      selectedCategoryId: null,
      categoryName: "",
      categoryStatus: "",
      categoryImage: null,
      categoryImagePreview: null,
      errors: {},
      searchQuery: "",
    };
  }

  componentDidMount() {
    this.fetchCategories();
  }

  fetchCategories = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/CategoryModel/categories"
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        this.setState({ categories: data });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      this.setState({ errors: { fetch: "Failed to fetch categories" } });
    }
  };

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
      errors: { ...this.state.errors, [event.target.name]: "" },
    });
  };

  handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      this.setState({
        categoryImage: file,
        categoryImagePreview: previewUrl,
        errors: { ...this.state.errors, categoryImage: "" },
      });
    }
  };

  validateForm = (isUpdate = false) => {
    let errors = {};
    let isValid = true;

    if (!this.state.categoryName.trim()) {
      errors.categoryName = "Category name is required";
      isValid = false;
    }

    if (!isUpdate && !this.state.categoryImage) {
      errors.categoryImage = "Category image is required";
      isValid = false;
    }

    if (!this.state.categoryStatus) {
      errors.categoryStatus = "Category status is required";
      isValid = false;
    }

    this.setState({ errors });
    return isValid;
  };
  handleSearch = (e) => {
    this.setState({ searchQuery: e.target.value });
  };
  handleSubmit = async (event) => {
    event.preventDefault();
    const isUpdate = this.state.UpdateCategoryForm;

    if (this.validateForm(isUpdate)) {
      const formData = new FormData();
      formData.append("categoryName", this.state.categoryName);
      formData.append("categoryStatus", this.state.categoryStatus);
      if (this.state.categoryImage) {
        formData.append("categoryImage", this.state.categoryImage);
      }

      try {
        let response;
        if (isUpdate) {
          response = await fetch(
            `http://localhost:5000/api/CategoryModel/update-category/${this.state.selectedCategoryId}`,
            {
              method: "PUT",
              body: formData,
            }
          );
        } else {
          response = await fetch(
            "http://localhost:5000/api/CategoryModel/add-category",
            {
              method: "POST",
              body: formData,
            }
          );
        }

        const data = await response.json();

        if (response.ok) {
          alert(
            isUpdate
              ? "Category updated successfully"
              : "Category added successfully"
          );
          this.setState({
            showCategoryForm: false,
            UpdateCategoryForm: false,
            ShowCategoryView: true,
            categoryName: "",
            categoryStatus: "",
            categoryImage: null,
            categoryImagePreview: null,
            errors: {},
            selectedCategoryId: null,
          });
          this.fetchCategories(); // Refresh category list
        } else {
          alert(data.error);
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        alert(`Error ${isUpdate ? "updating" : "adding"} category`);
      }
    }
  };

  ShowCategoryForm = () => {
    this.setState({
      ShowCategoryView: true,
      UpdateCategoryForm: false,
      showCategoryForm: true,
      selectedCategoryId: null,
      categoryName: "",
      categoryStatus: "",
      categoryImage: null,
      categoryImagePreview: null,
    });
  };

  UpdateCategory = (category) => {
    this.setState({
      ShowCategoryView: true,
      UpdateCategoryForm: true,
      showCategoryForm: false,
      selectedCategoryId: category._id,
      categoryName: category.categoryName || "", 
      categoryStatus: category.categoryStatus || "", 
      categoryImage: null, 
      categoryImagePreview: category.categoryImage
        ? `http://localhost:5000/public/images/category_images/${category.categoryImage}`
        : null, 
    });
  };

  handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/CategoryModel/delete-category/${id}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          alert("Category deleted successfully");
          this.fetchCategories(); // Refresh category list
        } else {
          const data = await response.json();
          alert(data.error);
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Error deleting category");
      }
    }
  };

  renderForm = () => {
    const { errors, categoryImagePreview, UpdateCategoryForm } = this.state;
    return (
      <form onSubmit={this.handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Category Name</label>
          <input
            type="text"
            name="categoryName"
            value={this.state.categoryName} // Ensure value is bound to state
            className={`form-control ${
              errors.categoryName ? "is-invalid" : ""
            }`}
            onChange={this.handleChange}
            placeholder="Enter category name"
          />
          <div className="invalid-feedback">{errors.categoryName}</div>
        </div>
        <div className="mb-3">
          <label className="form-label">Category Image</label>
          <input
            type="file"
            name="categoryImage"
            className={`form-control ${
              errors.categoryImage ? "is-invalid" : ""
            }`}
            onChange={this.handleFileChange}
          />
          <div className="invalid-feedback">{errors.categoryImage}</div>
          {categoryImagePreview && (
            <div className="mt-2" style={{ width: "100px", height: "100px" }}>
              <img
                src={categoryImagePreview}
                alt="Category Preview"
                className="img-thumbnail"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Category Status</label>
          <div>
            <label className="me-3">
              <input
                type="radio"
                name="categoryStatus"
                value="Active"
                checked={this.state.categoryStatus === "Active"}
                onChange={this.handleChange}
              />
              Active
            </label>
            <label>
              <input
                type="radio"
                name="categoryStatus"
                value="Inactive"
                checked={this.state.categoryStatus === "Inactive"}
                onChange={this.handleChange}
              />
              Inactive
            </label>
          </div>
          <div className="text-danger">{errors.categoryStatus}</div>
        </div>
        <div className="text-center">
          <button type="submit" className="btn btn-success">
            {UpdateCategoryForm ? "Update Category" : "Add Category"}
          </button>
        </div>
      </form>
    );
  };

  render() {
    const { categories, errors } = this.state;
    const filteredCategories = this.state.categories.filter((category) => {
      return category.categoryName
        .toLowerCase()
        .includes(this.state.searchQuery.toLowerCase());
    });
    return (
      <center>
        <div className="container ">
          <h2 className="text-center mb-4">Category</h2>
          <div className="d-flex justify-content-between mb-3">
            <div className="position-relative">
              <input
                type="text"
                className="form-control"
                placeholder="🔎Search categories..."
                value={this.state.searchQuery}
                onChange={this.handleSearch}
              />
            </div>
            <button
              id="toggleFormBtnI"
              className="btn btn-success"
              onClick={this.ShowCategoryForm}
            >
              Add Category
            </button>
          </div>
        </div>

        {this.state.showCategoryForm && (
          <div className="p-4 d-flex justify-content-center align-items-center">
            <section className="container">
              <div className="row justify-content-center">
                <div className="col-lg-6 col-md-8">
                  <div
                    className="card shadow-lg"
                    style={{ borderRadius: "15px" }}
                  >
                    <div className="card-body text-start">
                      <h1 className="text-black text-center mb-4">
                        Add Category
                      </h1>
                      <form onSubmit={this.handleSubmit} method="post">
                        <div className="mb-3">
                          <label className="form-label">Category Name</label>
                          <input
                            type="text"
                            name="categoryName"
                            className={`form-control ${
                              this.state.errors.categoryName ? "is-invalid" : ""
                            }`}
                            onChange={this.handleChange}
                          />
                          <div className="invalid-feedback">
                            {this.state.errors.categoryName}
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Category Image</label>
                          <input
                            type="file"
                            name="categoryImage"
                            // accept="image/png, image/jpeg, image/jpg"
                            className={`form-control ${
                              this.state.errors.categoryImage
                                ? "is-invalid"
                                : ""
                            }`}
                            onChange={this.handleFileChange}
                          />
                          <div className="invalid-feedback">
                            {this.state.errors.categoryImage}
                          </div>
                          {this.state.categoryImagePreview && (
                            <div
                              className="mt-2"
                              style={{ width: "100px", height: "100px" }}
                            >
                              <img
                                src={this.state.categoryImagePreview}
                                alt="Category Preview"
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

                        <div className="mb-3">
                          <label className="form-label">Category Status</label>
                          <div>
                            <label className="me-3">
                              <input
                                type="radio"
                                name="categoryStatus"
                                value="Active"
                                onChange={this.handleChange}
                              />
                              Active
                            </label>
                            <label>
                              <input
                                type="radio"
                                name="categoryStatus"
                                value="Inactive"
                                onChange={this.handleChange}
                              />
                              Inactive
                            </label>
                          </div>
                          <div className="text-danger">
                            {this.state.errors.categoryStatus}
                          </div>
                        </div>

                        <div className="text-center">
                          <button type="submit" className="btn btn-success">
                            Add Category
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

        {/* Category Update From start*/}
        {this.state.UpdateCategoryForm && (
          <div className="p-4 d-flex justify-content-center align-items-center">
            <section className="container">
              <div className="row justify-content-center">
                <div className="col-lg-6 col-md-8">
                  <div
                    className="card shadow-lg"
                    style={{ borderRadius: "15px" }}
                  >
                    <div className="card-body text-start">
                      <h1 className="text-black text-center mb-4">
                        Update Category
                      </h1>
                      <form onSubmit={this.handleSubmit}>
                        <div className="mb-3">
                          <label className="form-label">Category Name</label>
                          <input
                            type="text"
                            name="categoryName"
                            value={this.state.categoryName}
                            className={`form-control ${
                              this.state.errors.categoryName ? "is-invalid" : ""
                            }`}
                            onChange={this.handleChange}
                          />
                          <div className="invalid-feedback">
                            {this.state.errors.categoryName}
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Category Image</label>
                          <input
                            type="file"
                            // accept="image/png, image/jpeg, image/jpg"
                            className={`form-control ${
                              this.state.errors.categoryImage
                                ? "is-invalid"
                                : ""
                            }`}
                            onChange={this.handleFileChange}
                          />
                          <div className="invalid-feedback">
                            {this.state.errors.categoryImage}
                          </div>
                          {this.state.categoryImagePreview && (
                            <div
                              className="mt-2"
                              style={{ width: "100px", height: "100px" }}
                            >
                              <img
                                src={this.state.categoryImagePreview}
                                alt="Category Preview"
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

                        <div className="mb-3">
                          <label className="form-label">Category Status</label>
                          <div>
                            <label className="me-3">
                              <input
                                type="radio"
                                name="categoryStatus"
                                value="Active"
                                onChange={this.handleChange}
                              />
                              Active
                            </label>
                            <label>
                              <input
                                type="radio"
                                name="categoryStatus"
                                value="Inactive"
                                onChange={this.handleChange}
                              />
                              Inactive
                            </label>
                          </div>
                          <div className="text-danger">
                            {this.state.errors.categoryStatus}
                          </div>
                        </div>

                        <div className="text-center py-3">
                          <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                          >
                            Update Category
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
        {/* Category Update From end*/}
        {/* Category View */}
        {this.state.ShowCategoryView && (
          <div className="row mt-3">
            <div className="col-10 offset-1">
              <div className="table-responsive">
                <table className="table table-bordered text-center align-middle">
                  <thead className="table table-bordered">
                    <tr>
                      <th>Sr No</th>
                      <th>Category Image</th>
                      <th>Category Name</th>
                      <th>Status</th>
                      <th>Update</th>
                      <th>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted">
                          No categories found.
                        </td>
                      </tr>
                    ) : (
                      filteredCategories.map((category, index) => (
                        <tr key={category._id}>
                          <td>{index + 1}</td>
                          <td>
                            <img
                              src={
                                category.categoryImage
                                  ? `http://localhost:5000/public/images/category_images/${category.categoryImage}`
                                  : c1
                              }
                              alt={category.categoryName}
                              style={{ height: "70px", width: "70px" }}
                            />
                          </td>
                          <td>{category.categoryName}</td>
                          <td
                            className={
                              category.categoryStatus === "Active"
                                ? "text-success fw-bold"
                                : "text-danger fw-bold"
                            }
                          >
                            {category.categoryStatus}
                          </td>
                          <td>
                            <button
                              className="btn btn-primary"
                              onClick={() => this.UpdateCategory(category)}
                            >
                              <i className="bi bi-arrow-down"></i> Update
                            </button>
                          </td>
                          <td>
                            <button
                              className="btn btn-danger"
                              onClick={() => this.handleDelete(category._id)}
                            >
                              <i className="bi bi-trash"></i> Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {/* Add Category Form  */}
        {/* Pagenation start */}
        <div className="row">
          <div className="col-md-5"></div>
          <nav className="col-md-2">
            <ul className="pagination">
              <li className="page-item">
                <a className="page-link btn-dark" href="#">
                  1<i className="fa fa-chevron-left"></i>
                </a>
              </li>
              <li className="page-item">
                <a className="page-link btn-outline-dark" href="#">
                  2
                </a>
              </li>
              <li className="page-item">
                <a className="page-link btn-dark" href="#">
                  3<i className="fa fa-chevron-right"></i>
                </a>
              </li>
            </ul>
          </nav>
          <div className="col-md-5"></div>
        </div>
        {/* Pagination End */}
      </center>
    );
  }
}

export default AddCategory;
