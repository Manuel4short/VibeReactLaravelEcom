import React, { useState } from "react";
import { useCart } from "../CartContext";
import axios from "axios";
import PaystackPop from "@paystack/inline-js";

function Cart() {
  const { cart, removeFromCart, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
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
          try {
            console.log("Payment successful, creating order...");

            await axios.post(`${process.env.REACT_APP_API_URL}/api/checkout`, {
              cart,
              payment_method: "paystack",
              reference: transaction.reference,
              email,
              total_amount: totalAmount,
              payment_id: transaction.transaction,
            });

            console.log("Order created, verifying payment...");

            const verifyResponse = await axios.post(
              `${process.env.REACT_APP_API_URL}/api/verify-payment`,
              {
                reference: transaction.reference,
                payment_method: "paystack",
                email,
              }
            );

            console.log("Verify response:", verifyResponse.data);

            alert("Payment successful!");
            clearCart();
          } catch (err) {
            console.error("Full error:", err);
            console.error("Error response:", err.response?.data);
            console.error("Error status:", err.response?.status);
            alert(`Error: ${err.response?.data?.message || err.message}`);
          }
        },
        onCancel: () => alert("Payment cancelled"),
      });
    } catch (error) {
      console.error("Checkout error:", error);
      alert(`Checkout failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="container mt-4">
      <h4 className="text-center mb-4">Your Cart</h4>

      {/* Cart items in smaller cards */}
      <div className="row justify-content-center">
        {cart.map((item) => (
          <div className="col-md-3 col-sm-6 mb-4" key={item.id}>
            <div className="card shadow-sm small-card">
              <img
                className="card-img-top"
                src={`${process.env.REACT_APP_API_URL}/storage/${
                  item.preview_image || item.file_path
                }`}
                alt={item.name}
                style={{ height: "150px", objectFit: "contain", width: "100%" }}
                onError={(e) => (e.target.src = "/default.png")}
              />
              <div className="card-body p-2 text-center">
                <h6 className="card-title">{item.name}</h6>
                <p className="card-text mb-1">Qty: {item.quantity}</p>
                <p className="card-text mb-1">
                  <strong>${item.price * item.quantity}</strong>
                </p>
                <button
                  className="btn btn-sm btn-danger w-100"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment section centered */}
      <div className="d-flex justify-content-center mt-4">
        <div
          className="card p-4 shadow"
          style={{ maxWidth: "400px", width: "100%" }}
        >
          <h5 className="text-center mb-3">Enter Email & Pay</h5>
          <input
            type="email"
            className="form-control mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="customer@email.com"
            required
          />

          <p className="text-center">Paystack (Card/USSD)</p>
          <h5 className="text-center mt-2 mb-3">
            Total: ${formatPrice(totalAmount)}
          </h5>

          <button
            className="btn btn-success w-100 mb-2"
            onClick={handleCheckout}
            disabled={isLoading || !email}
          >
            {isLoading ? "Processing..." : "Checkout"}
          </button>
          <button className="btn btn-warning w-100" onClick={clearCart}>
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
