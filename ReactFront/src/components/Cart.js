import React from "react";
import { useLocation } from "react-router-dom";

function Cart() {
  const location = useLocation();
  const cart = location.state?.cart || []; // Retrieve the cart state

  if (cart.length === 0) {
    return <div className="text-center mt-5">Your cart is empty.</div>;
  }

  return (
    <div className="container mt-4">
      <h4 className="text-center mb-4">Your Cart</h4>
      <div className="row">
        {cart.map((item) => (
          <div className="col-md-4 mb-4" key={item.id}>
            <div className="card shadow-sm">
              <img
                className="card-img-top"
                // src={`${
                //   process.env.REACT_APP_API_URL || "http://localhost:8000"
                // }/storage/${item.file_path}`}
                src={item.image_url}
                alt={item.name}
                style={{ height: "200px", objectFit: "contain", width: "100%" }}
              />
              <div className="card-body">
                <h5 className="card-title">{item.name}</h5>
                <p className="card-text">Quantity: {item.quantity}</p>
                <p className="card-text">
                  <strong>${item.price * item.quantity}</strong>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Cart;
