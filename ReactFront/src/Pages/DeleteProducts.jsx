import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";
import { usePopup } from "../Contexts/PopupContext";

export default function DeleteProducts() {
  const [products, setProducts] = useState([]);
  const { showPopup } = usePopup();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/list`);
    setProducts(res.data);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // 👇 NEW (optional but nice)
      showPopup(res.data.message);

      // refresh list
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      showPopup(
        error.response?.data?.message || "Failed to delete product",
        "error"
      );
    }
  };

  return (
    <>
      <div className="container" style={{ maxWidth: "700px" }}>
        <h4 className="mb-4">Delete Products (Admin)</h4>

        {products.map((p) => (
          <div
            key={p.id}
            className="d-flex align-items-center justify-content-between border p-2 mb-2"
          >
            <div className="d-flex align-items-center gap-3">
              <img
                src={`${import.meta.env.VITE_API_URL}/storage/${
                  p.preview_image || p.file_path
                }`}
                alt={p.name}
                style={{ width: "60px", height: "60px", objectFit: "contain" }}
                onError={(e) => (e.target.src = "/default.png")}
              />

              <span>{p.name}</span>
            </div>

            <Button variant="danger" onClick={() => deleteProduct(p.id)}>
              Delete
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
