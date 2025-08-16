import { useState } from "react";

function AddProduct() {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(""); // State to hold error messages

  const API_URL = "http://localhost:8000/api/addproduct";

  async function addProduct(e) {
    e.preventDefault();

    // Basic validation checks
    if (!name || !price || !description || !file) {
      setError("Please fill all fields and select a file");
      return;
    }

    // Check if price is a valid number
    if (isNaN(price)) {
      setError("Price must be a valid number");
      return;
    }

    setError(""); // Clear any previous errors

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
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      const responseData = await response.json();

      if (response.ok) {
        alert("Product added successfully");
        console.log("Response:", responseData);
        // Clear form fields after successful submission
        setName("");
        setFile(null);
        setPrice("");
        setDescription("");
      } else {
        console.error("Error response:", responseData);
        setError(`Error: ${responseData.message || "Unknown error occurred"}`);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      setError("Failed to add product");
    }
  }

  return (
    <>
      <div className="col-sm-6 container">
        <h1>Add Product</h1>
        <form onSubmit={addProduct}>
          {error && <div className="alert alert-danger">{error}</div>}{" "}
          {/* Display error message */}
          <input
            type="text"
            className="form-control"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />{" "}
          <br />
          <input
            type="file"
            className="form-control"
            onChange={(e) => setFile(e.target.files[0])}
          />{" "}
          <br />
          <input
            type="text"
            className="form-control"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />{" "}
          <br />
          <input
            type="text"
            className="form-control"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />{" "}
          <br />
          <button type="submit" className="form-control btn btn-primary">
            Add Product
          </button>
        </form>
      </div>
    </>
  );
}

export default AddProduct;
