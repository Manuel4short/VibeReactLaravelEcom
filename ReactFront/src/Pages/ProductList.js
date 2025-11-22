import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import axios from "axios";
import { useCart } from "../CartContext"; // adjust path if needed

function ProductList() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart(); // 👈 use context here

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const response = await axios.get("http://localhost:8000/api/list");
      setData(response.data);
    } catch (error) {
      setError("Failed to fetch data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <div className="text-center mt-5">Error: {error}</div>;
  if (data.length === 0)
    return <div className="text-center mt-5">No products available.</div>;

  return (
    <div className="container-fluid ">
      <h4 className="text-center mb-4" style={{ fontStyle: "italic" }}>
        Products Listed Here
      </h4>

      <div className="row">
        {data.map((dataitem) => (
          <div
            className="col-lg-4 col-md-4 col-sm-6 col-12 mb-5"
            key={dataitem.id}
          >
            <div className="card shadow-sm">
              <img
                className="card-img-top "
                src={`http://localhost:8000/storage/${
                  dataitem.preview_image || dataitem.file_path
                }`}
                alt={dataitem.name}
                style={{
                  height: "200px",
                  objectFit: "contain",
                  width: "100%",
                  paddingTop: "10px",
                }}
                onError={(e) => (e.target.src = "/default.png")}
              />
              <div className="card-body">
                <h5 className="card-title">{dataitem.name}</h5>
                <p className="card-text">{dataitem.description}</p>
                <p className="card-text">
                  <strong>${dataitem.price}</strong>
                </p>
                <Button
                  onClick={() => addToCart(dataitem)}
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
