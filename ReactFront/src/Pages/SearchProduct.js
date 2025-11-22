import React, { useState } from "react";
import { Card, Button } from "react-bootstrap";
import { useCart } from "../CartContext"; // use your cart context

function SearchProduct() {
  const [data, setData] = useState([]);
  const { addToCart } = useCart(); // 👈 cart context

  async function search(key) {
    if (key.trim() === "") {
      setData([]); // clear products if search is empty
      return;
    }

    try {
      let result = await fetch(`http://127.0.0.1:8000/api/search/${key}`);
      result = await result.json();
      setData(result);
    } catch (error) {
      console.error("Search failed", error);
      setData([]);
    }
  }

  return (
    <div className="container mt-3 d-flex flex-column align-items-center">
      <h1 className="mb-4">Search Product</h1>
      <input
        type="text"
        onChange={(e) => search(e.target.value)}
        className="form-control mb-4"
        placeholder="Search for a product"
        style={{ maxWidth: "400px" }}
      />

      <div className="d-flex flex-wrap justify-content-center">
        {data.length === 0 ? (
          <p>No products to display</p>
        ) : (
          data.map((item) => (
            <Card
              key={item.id}
              className="mb-4 shadow-sm"
              style={{ width: "18rem", margin: "10px" }}
            >
              <Card.Img
                variant="top"
                src={`http://localhost:8000/storage/${
                  item.preview_image || item.file_path
                }`}
                alt={item.name}
                style={{
                  height: "200px",
                  objectFit: "contain",
                  width: "100%",
                  paddingTop: "10px",
                  padding: "10px", // ✅ add top padding
                }}
                onError={(e) => (e.target.src = "/default.png")}
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title className="text-truncate" title={item.name}>
                  {item.name}
                </Card.Title>
                <Card.Text className="text-truncate" title={item.description}>
                  {item.description}
                </Card.Text>
                <Card.Text>
                  <strong>${item.price}</strong>
                </Card.Text>
                <Button
                  onClick={() => addToCart(item)}
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
