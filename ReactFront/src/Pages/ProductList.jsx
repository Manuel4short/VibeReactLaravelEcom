import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import axios from "axios";
import { useCart } from "../Contexts/CartContext"; // adjust path if needed
import { usePopup } from "../Contexts/PopupContext";

function ProductList() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart(); // 👈 use context here
  const { showPopup } = usePopup();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/list`
      );
      setData(response.data);
    } catch (error) {
      showPopup("Failed to fetch data. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) return <div className="text-center mt-5">Loading...</div>;
  if (data.length === 0)
    return <div className="text-center mt-5">No products available.</div>;

  return (
    <div className="container-fluid ">
      {/* <h4 className="text-center mb-4" style={{ fontStyle: "italic" }}>
        Products Listed Here
      </h4> */}

      <div className="row">
        {data.map((product) => (
          <div
            className="col-lg-4 col-md-4 col-sm-6 col-12 mb-5"
            key={product.id}
          >
            <div className="card shadow-sm">
              <div className="card-img-box">
                <img
                  loading="lazy"
                  className="card-img-top product-image"
                  src={`${import.meta.env.VITE_API_URL}/storage/${
                    product.preview_image || product.file_path
                  }`}
                  alt={product.name}
                  style={{
                    height: "200px",
                    // objectFit: "contain",
                    width: "100%",
                    // paddingTop: "10px",
                  }}
                  onError={(e) => (e.target.src = "/default.png")}
                />
              </div>
              <div className="card-body">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text">{product.description}</p>
                <p className="card-text">
                  <strong>₦{Number(product.price).toLocaleString()}</strong>
                </p>
                <Button
                  onClick={() => {
                    addToCart(product);
                    showPopup(`${product.name} added to cart!`);
                  }}
                  className="w-100 add-to-cart-btn fw-bold"
                >
                  Add To Cart
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;
