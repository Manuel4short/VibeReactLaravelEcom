import React from "react";
import { useCart } from "../CartContext"; // adjust path

function Cart() {
  const { cart, removeFromCart, clearCart } = useCart();

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
                src={`http://localhost:8000/storage/${item.file_path}`}
                alt={item.name}
                style={{ height: "200px", objectFit: "contain", width: "100%" }}
              />
              <div className="card-body">
                <h5 className="card-title">{item.name}</h5>
                <p className="card-text">Quantity: {item.quantity}</p>
                <p className="card-text">
                  <strong>${item.price * item.quantity}</strong>
                </p>
                <button
                  className="btn btn-danger w-100"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="btn btn-warning mt-3" onClick={clearCart}>
        Clear Cart
      </button>
    </div>
  );
}

export default Cart;
