import React, { useState } from "react";
import { useCart } from "../CartContext";
import axios from "axios";
import PaystackPop from "@paystack/inline-js";
import { loadStripe } from "@stripe/stripe-js"; // Add Stripe
import { FlutterWaveButton, closePaymentModal } from "flutterwave-react-v3";

function Cart() {
  const { cart, removeFromCart, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("card");
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

      switch (paymentMethod) {
        case "card": // Paystack (Cards/USSD)
          console.log("Paystack Key:", process.env.REACT_APP_PAYSTACK_KEY);
          console.log("Amount:", totalAmount * 100, "Email:", email);
          console.log("Cart Details:", cart); // Added to verify cart structure
          const paystack = new PaystackPop();
          paystack.newTransaction({
            key: process.env.REACT_APP_PAYSTACK_KEY, // Use env variable
            amount: totalAmount * 100, // In kobo
            email,
            allowIframeFocus: true, // Enable iframe focus
            channels: ["card"], // Force card payment
            onSuccess: async (transaction) => {
              console.log("Transaction Response:", transaction);
              console.log("Payload Sent:", {
                cart,
                payment_method: "paystack",
                total_amount: totalAmount,
                reference: transaction.reference,
                email,
                payment_id: transaction.transaction,
              });
              await axios.post("http://localhost:8000/api/checkout", {
                cart,
                payment_method: "paystack",
                total_amount: totalAmount,
                reference: transaction.reference,
                email, // Added to match backend validation
                payment_id: transaction.transaction,
              });

              // 👇 Call verifyPayment immediately after
              await axios.post("http://localhost:8000/api/verify-payment", {
                reference: transaction.reference,
                payment_method: "paystack",
                email,
              });
              alert("Payment successful!");
              clearCart();
            },
            onCancel: () => alert("Payment cancelled"),
          });
          break;

        case "paypal": // Flutterwave for PayPal
          const flutterwave = new Flutterwave({
            public_key: process.env.REACT_APP_FLUTTERWAVE_KEY, // Use env variable
            tx_ref: `tx_${Date.now()}`,
            amount: totalAmount,
            currency: "NGN",
            payment_options: "paypal",
            customer: { email },
          });
          flutterwave.checkout({
            onclose: () => alert("Payment cancelled"),
            callback: async (response) => {
              if (response.status === "successful") {
                await axios.post("http://localhost:8000/api/checkout", {
                  cart,
                  payment_method: "flutterwave",
                  total_amount: totalAmount,
                  reference: response.transaction_id,
                });
                alert("Payment successful!");
                clearCart();
              }
              flutterwave.close();
            },
          });
          break;

        case "stripe": // Stripe for global cards
          const stripe = await loadStripe(process.env.REACT_APP_STRIPE_KEY); // Use env variable
          const { data } = await axios.post(
            "http://localhost:8000/api/stripe-payment",
            {
              amount: totalAmount * 100, // In cents
              email,
              cart,
            }
          );
          const result = await stripe.redirectToCheckout({
            sessionId: data.id,
          });
          if (result.error) throw new Error(result.error.message);
          // Backend handles success via webhook
          break;

        case "bank": // Bank Transfer
          await axios.post("http://localhost:8000/api/checkout", {
            cart,
            payment_method: "bank",
            total_amount: totalAmount,
            reference: `bank_${Date.now()}`,
          });
          alert("Bank transfer details sent! Check your email.");
          clearCart();
          break;

        case "cash": // Cash on Delivery
          await axios.post("http://localhost:8000/api/checkout", {
            cart,
            payment_method: "cash",
            total_amount: totalAmount,
            reference: `cod_${Date.now()}`,
          });
          alert("Order placed! Pay on delivery.");
          clearCart();
          break;

        default:
          throw new Error("Invalid payment method");
      }
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
                src={`http://localhost:8000/storage/${
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
      {/* Payment method selection */}
      <div className="mt-4">
        <h5>Select Payment Method</h5>
        <select
          className="form-control"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="card">Paystack (Card/USSD)</option>
          <option value="paypal">PayPal</option>
          <option value="stripe">Stripe (Card)</option>
          <option value="bank">Bank Transfer</option>
          <option value="cash">Cash on Delivery</option>
        </select>
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
