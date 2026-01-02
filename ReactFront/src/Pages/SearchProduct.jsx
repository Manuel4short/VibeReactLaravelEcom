import React, { useState, useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import { useCart } from "../Contexts/CartContext";
import { usePopup } from "../Contexts/PopupContext";

function SearchProduct() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart } = useCart();
  const { showPopup } = usePopup();

  // debounce input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // fetch when debounced value changes
  useEffect(() => {
    if (!debouncedTerm) {
      setData([]);
      setIsLoading(false);
      return;
    }
    search(debouncedTerm);
  }, [debouncedTerm]);

  async function search(key) {
    if (!key) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/search/${key}`
      );

      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Search failed", error);
      showPopup("Search failed. Try again.", "error");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mt-3 d-flex flex-column align-items-center">
      <h3 className="mb-4">Search Product</h3>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="form-control mb-4"
        placeholder="Search for a product"
        style={{ maxWidth: "400px" }}
      />

      <div className="d-flex flex-wrap justify-content-center">
        {isLoading ? (
          <p>Loading...</p>
        ) : debouncedTerm && data.length === 0 ? (
          <p>No products found</p>
        ) : (
          data.map((product) => (
            <Card
              key={product.id}
              className="mb-4 shadow-sm"
              style={{ width: "18rem", margin: "10px" }}
            >
              <div className="card-img-box">
                <Card.Img
                  variant="top"
                  loading="lazy"
                  src={`${import.meta.env.VITE_API_URL}/storage/${
                    product.preview_image || product.file_path
                  }`}
                  alt={product.name}
                  style={{
                    height: "200px",
                    objectFit: "contain",
                    width: "100%",
                    padding: "10px",
                  }}
                  onError={(e) => (e.target.src = "/default.png")}
                />
              </div>
              <Card.Body className="d-flex flex-column">
                <Card.Title className="text-truncate" title={product.name}>
                  {product.name}
                </Card.Title>
                <Card.Text
                  className="text-truncate"
                  title={product.description}
                >
                  {product.description}
                </Card.Text>
                <Card.Text>
                  <strong>₦{product.price.toLocaleString()}</strong>
                </Card.Text>
                <Button
                  onClick={() => addToCart(product)}
                  className="mt-auto add-to-cart-btn w-100 fw-bold"
                >
                  Add To Cart
                </Button>
              </Card.Body>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default SearchProduct;
