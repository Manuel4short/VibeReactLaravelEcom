import { useState } from "react";
import axios from "axios";

function AddProduct() {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const API_URL = "http://localhost:8000/api/addproduct";

  async function addProduct(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("file", file);
    formData.append("price", price);
    formData.append("description", description);

    console.log("Form data:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const response = await axios.post(API_URL, formData);
      alert("Product added successfully");
      console.log("Product added:", response.data);
      setErrors({});
      setGeneralError("");
    } catch (error) {
      if (error.response) {
        setErrors(
          error.response.data.errors || {
            general: [error.response.data.message || "An error occurred"],
          }
        );
        setGeneralError(error.response.data.message || "An error occurred");
      } else {
        setErrors({ general: ["Something went wrong. Try again later."] });
        setGeneralError("Something went wrong. Try again later.");
      }
    }
  }

  return (
    <div className="col-sm-6 container">
      <h1>Add Product</h1>
      <form onSubmit={addProduct}>
        {generalError && (
          <div className="alert alert-danger">{generalError}</div>
        )}
        <div>
          <label>Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <div className="text-danger">{errors.name[0]}</div>}
        </div>
        <br />
        <div>
          <label>File (JPG, PNG, or PDF)</label>
          <input
            type="file"
            className="form-control"
            accept="image/jpeg,image/png,application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />
          {errors.file && <div className="text-danger">{errors.file[0]}</div>}
        </div>
        <br />
        <div>
          <label>Price</label>
          <input
            type="text"
            className="form-control"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          {errors.price && <div className="text-danger">{errors.price[0]}</div>}
        </div>
        <br />
        <div>
          <label>Description</label>
          <input
            type="text"
            className="form-control"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {errors.description && (
            <div className="text-danger">{errors.description[0]}</div>
          )}
        </div>
        <br />
        <button type="submit" className="form-control btn btn-primary">
          Add Product
        </button>
      </form>
    </div>
  );
}

export default AddProduct;
