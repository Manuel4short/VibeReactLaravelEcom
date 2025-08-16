import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

function UpdateProduct() {
  const [data, setData] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [productId, setProductId] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/list");
        setData(response.data);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };
    fetchProducts();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setImageUrl(reader.result); // Set the preview image URL
      };
      reader.readAsDataURL(selectedFile); // Convert the file to a data URL for preview
    }
  };

  const handleProductChange = (e) => {
    const selectedId = parseInt(e.target.value);
    setProductId(selectedId);
    const selectedProduct = data.find((product) => product.id === selectedId);
    if (selectedProduct) {
      setName(selectedProduct.name || "");
      setPrice(selectedProduct.price || "");
      setDescription(selectedProduct.description || "");
      setImageUrl(`http://localhost:8000/storage/${selectedProduct.file_path}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("_method", "PUT"); // Add this line
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);
    if (file) {
      formData.append("file", file);
    }

    try {
      const response = await axios.post(
        `http://localhost:8000/api/product/${productId}`,
        formData,
        {
          // Use POST instead of PUT
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 200) {
        const updatedProduct = response.data.product;
        setImageUrl(
          `http://localhost:8000/storage/${updatedProduct.file_path}`
        );
        setData((prevData) =>
          prevData.map((prod) =>
            prod.id === updatedProduct.id ? updatedProduct : prod
          )
        );
        alert("Product updated successfully!");
      } else {
        console.error("Error updating product:", response.status);
      }
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  return (
    <>
      <div className="container mt-3">
        <h3 className="text-center mb-2" style={{ fontSize: "1.5rem" }}>
          Update Product
        </h3>
        <form
          onSubmit={handleSubmit}
          className="border p-2 rounded shadow mx-auto mb-4"
          style={{ maxWidth: "350px" }}
        >
          <div className="mb-2">
            <label
              htmlFor="product-select"
              className="form-label"
              style={{ fontSize: "0.9rem" }}
            >
              Select Product
            </label>
            <select
              id="product-select"
              className="form-select"
              value={productId}
              onChange={handleProductChange}
              style={{ fontSize: "0.9rem" }}
            >
              <option value="">Select a product</option>
              {data.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label
              htmlFor="product-name"
              className="form-label"
              style={{ fontSize: "0.9rem" }}
            >
              Product Name
            </label>
            <input
              id="product-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control"
              placeholder="Enter product name"
              required
              style={{ fontSize: "0.9rem" }}
            />
          </div>
          <div className="mb-2">
            <label
              htmlFor="product-price"
              className="form-label"
              style={{ fontSize: "0.9rem" }}
            >
              Price
            </label>
            <input
              id="product-price"
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="form-control"
              placeholder="Enter price"
              required
              style={{ fontSize: "0.9rem" }}
            />
          </div>
          <div className="mb-2">
            <label
              htmlFor="product-description"
              className="form-label"
              style={{ fontSize: "0.9rem" }}
            >
              Description
            </label>
            <textarea
              id="product-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-control"
              placeholder="Enter description"
              required
              style={{ fontSize: "0.9rem", height: "80px" }}
            />
          </div>
          <div className="mb-2">
            <label
              htmlFor="product-file"
              className="form-label"
              style={{ fontSize: "0.9rem" }}
            >
              Upload Image
            </label>
            <input
              id="product-file"
              type="file"
              onChange={handleFileChange}
              className="form-control"
              style={{ fontSize: "0.9rem" }}
            />
          </div>
          {imageUrl && (
            <img
              className="img-thumbnail mb-2"
              src={imageUrl}
              alt="product"
              style={{ width: "150px", marginTop: "5px" }}
            />
          )}

          <button
            type="submit"
            className="btn btn-primary w-100"
            style={{ fontSize: "0.9rem" }}
          >
            Update Product
          </button>
        </form>
      </div>
    </>
  );
}

export default UpdateProduct;
