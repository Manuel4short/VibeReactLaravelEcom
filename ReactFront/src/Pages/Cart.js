import React, { useState } from "react";
import { useCart } from "../CartContext";
import axios from "axios";
import PaystackPop from "@paystack/inline-js";

function Cart() {
  const { cart, removeFromCart, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState(""); // Add dynamic email input
  const formatPrice = (amount) => Math.round(amount * 100) / 100;

  if (cart.length === 0) {
    return <div className="text-center mt-5">Your cart is empty.</div>;
  }

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      if (!email) {
        alert("Please enter an email address");
        setIsLoading(false);
        return;
      }

      const paystack = new PaystackPop();

      paystack.newTransaction({
        key: process.env.REACT_APP_PAYSTACK_KEY,
        amount: totalAmount * 100,
        email,
        allowIframeFocus: true,
        channels: ["card"],

        onSuccess: async (transaction) => {
          await axios.post(`${process.env.REACT_APP_API_URL}/api/checkout`, {
            cart,
            payment_method: "paystack",
            reference: transaction.reference,
            email,
            total_amount: totalAmount,
            payment_id: transaction.transaction,
          });

          await axios.post(
            `${process.env.REACT_APP_API_URL}/api/verify-payment`,
            {
              reference: transaction.reference,
              payment_method: "paystack",
              email,
            }
          );

          alert("Payment successful!");
          clearCart();
        },

        onCancel: () => alert("Payment cancelled"),
      });
    } catch (error) {
      alert(`Checkout failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h4 className="text-center mb-4">Your Cart</h4>
      <div className="row">
        {cart.map((item) => (
          <div className="col-md-4 mb-4" key={item.id}>
            <div className="card shadow-sm">
              <img
                className="card-img-top"
                src={`${process.env.REACT_APP_API_URL}/storage/${
                  item.preview_image || item.file_path
                }`}
                alt={item.name}
                style={{ height: "200px", objectFit: "contain", width: "100%" }}
                onError={(e) => (e.target.src = "/default.png")}
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
      {/* Email input */}
      <div className="mt-4">
        <h5>Enter Email</h5>
        <input
          type="email"
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="customer@email.com"
          required
        />
      </div>

      <div className="mt-4">
        <h5>Proceed with Payment</h5>

        <p>Paystack (Card/USSD)</p>
      </div>

      <h5 className="mt-3">Total: ${formatPrice(totalAmount)}</h5>
      <button
        className="btn btn-success mt-3"
        onClick={handleCheckout}
        disabled={isLoading || !email}
      >
        {isLoading ? "Processing..." : "Checkout"}
      </button>
      <button className="btn btn-warning mt-3 ms-2" onClick={clearCart}>
        Clear Cart
      </button>
    </div>
  );
}

export default Cart;
