import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { usePopup } from "../Contexts/PopupContext";

function UpdateProduct() {
  const [data, setData] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [productId, setProductId] = useState(null);
  const { showPopup } = usePopup();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/list`
        );
        setData(response.data);
      } catch (error) {
        console.error("Error fetching product data:", error);
        showPopup("Failed to load products.", "error");
      }
    };
    fetchProducts();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    // ⛔ Prevent re-processing the same file
    if (file === selectedFile) return;
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      // Only generate preview for images (jpg, jpeg, png, webp), not pdf or others
      if (selectedFile.type.startsWith("image/")) {
        reader.onloadend = () => setImageUrl(reader.result);
        reader.readAsDataURL(selectedFile);
      } else {
        setImageUrl(""); // Clear preview for non-image files (e.g., pdf, epub, mobi)
      }
    }
  };

  const handleProductChange = (e) => {
    const selectedId = parseInt(e.target.value, 10);
    setProductId(selectedId);
    const selectedProduct = data.find((product) => product.id === selectedId);
    if (selectedProduct) {
      setName(selectedProduct.name || "");
      setPrice(selectedProduct.price || "");
      setDescription(selectedProduct.description || "");
      setImageUrl(
        selectedProduct.file_path
          ? `${import.meta.env.VITE_API_URL}/storage/${
              selectedProduct.file_path
            }`
          : ""
      );
      // ✅ Clear previous file when switching products
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productId) {
      showPopup("Please select a product.", "error"); // optional
      return;
    }
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);
    if (file) formData.append("file", file);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/product/${productId}`,
        formData
      );
      if (response.status === 200) {
        const updatedProduct = response.data.product;
        // Update imageUrl only if the updated file is an image
        if (
          updatedProduct.file_path.endsWith(".jpg") ||
          updatedProduct.file_path.endsWith(".jpeg") ||
          updatedProduct.file_path.endsWith(".png") ||
          updatedProduct.file_path.endsWith(".webp")
        ) {
          setImageUrl(
            `${import.meta.env.VITE_API_URL}/storage/${
              updatedProduct.file_path
            }`
          );
        } else {
          setImageUrl(""); // Clear for PDF or other non-image files
        }
        setData((prevData) =>
          prevData.map((prod) =>
            prod.id === updatedProduct.id ? updatedProduct : prod
          )
        );
        showPopup("Product updated successfully!");
      } else {
        console.error("Error updating product:", response.status);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      showPopup("Update failed. Try again.", "error");
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
              type="number"
              step="0.01"
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
              style={{ fontSize: "0.9rem", height: "80px" }}
            />
          </div>
          <div className="mb-2">
            <label
              htmlFor="product-file"
              className="form-label"
              style={{ fontSize: "0.9rem" }}
            >
              Upload Product (JPEG, PNG, WebP, PDF)
            </label>
            <input
              id="product-file"
              type="file"
              onChange={handleFileChange}
              className="form-control"
              style={{ fontSize: "0.9rem" }}
              accept=".jpg,.jpeg,.png,.webp,.pdf"
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
            disabled={!productId || !name || !price}
          >
            Update Product
          </button>
        </form>
      </div>
    </>
  );
}

export default UpdateProduct;
