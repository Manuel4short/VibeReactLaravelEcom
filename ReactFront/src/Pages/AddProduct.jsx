import { useState } from "react";
import axios from "axios";
import { usePopup } from "../Contexts/PopupContext";

function AddProduct() {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const { showPopup } = usePopup();
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = `${import.meta.env.VITE_API_URL}/api/addproduct`;

  async function addProduct(e) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("file", file);
    formData.append("price", price);
    formData.append("description", description);

    try {
      const response = await axios.post(API_URL, formData);
      showPopup("Product added successfully"); // ✅ success popup
      setName("");
      setFile(null);
      setPrice("");
      setDescription("");

      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = null;
    } catch (error) {
      // show error popup, prioritizing backend message if available
      const message =
        error.response?.data?.message ||
        "Something went wrong. Try again later.";
      showPopup(message, "error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="col-sm-6 container">
      <h1>Add Product</h1>
      <form onSubmit={addProduct}>
        <div>
          <label>Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
        </div>
        <br />
        <button
          type="submit"
          className="form-control btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? "Adding..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}

export default AddProduct;
