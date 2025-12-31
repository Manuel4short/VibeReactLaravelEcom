import React, { useState, useMemo } from "react";
import { useCart } from "../CartContext";
import axios from "axios";
import PaystackPop from "@paystack/inline-js";
import { usePopup } from "../Contexts/PopupContext"; // add this

function Cart() {
  const { cart, removeFromCart, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const { showPopup } = usePopup();

  const formatPrice = (amount) => Math.round(amount * 100) / 100;

  const handleRemove = (id) => {
    removeFromCart(id);
    showPopup("Item removed from cart"); // optional popup
  };

  if (cart.length === 0) {
    return <div className="text-center mt-5">Your cart is empty.</div>;
  }

  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const handleCheckout = async () => {
    if (isLoading) return; // 👈 ADD THIS
    setIsLoading(true);
    try {
      if (!email) {
        showPopup("Please enter an email address", "error");
        setIsLoading(false);
        return;
      }

      const paystack = new PaystackPop();
      paystack.newTransaction({
        key: import.meta.env.VITE_PAYSTACK_KEY,
        amount: totalAmount * 100,
        email,
        allowIframeFocus: true,
        channels: ["card"],

        onSuccess: async (transaction) => {
          try {
            console.log("Payment successful, creating order...");

            await axios.post(`${import.meta.env.VITE_API_URL}/api/checkout`, {
              cart,
              payment_method: "paystack",
              reference: transaction.reference,
              email,
              total_amount: totalAmount,
              payment_id: transaction.transaction,
            });

            console.log("Order created, verifying payment...");

            const verifyResponse = await axios.post(
              `${import.meta.env.VITE_API_URL}/api/verify-payment`,
              {
                reference: transaction.reference,
                payment_method: "paystack",
                email,
              }
            );

            console.log("Verify response:", verifyResponse.data);

            showPopup("Payment successful!");
            clearCart();
            setIsLoading(false);
          } catch (err) {
            console.error("Full error:", err);
            console.error("Error response:", err.response?.data);
            console.error("Error status:", err.response?.status);
            showPopup(
              `Error: ${err.response?.data?.message || err.message}`,
              "error"
            );
            setIsLoading(false); // ✅ ADD THIS
          }
        },
        onCancel: () => {
          showPopup("Payment cancelled");
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error("Checkout error:", error);
      showPopup(`Checkout failed: ${error.message}`, "error");
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
                loading="lazy"
                className="card-img-top"
                src={`${import.meta.env.VITE_API_URL}/storage/${
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
                  onClick={() => handleRemove(item.id)}
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
