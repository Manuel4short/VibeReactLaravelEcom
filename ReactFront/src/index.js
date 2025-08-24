import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProductList from "./components/ProductList";
import Login from "./components/Login";
import Register from "./components/Register";
import AddProduct from "./components/AddProduct";
import UpdateProduct from "./components/UpdateProduct";
import SearchProduct from "./components/SearchProduct";
import Cart from "./components/Cart";
import Protected from "./components/Protected";
import Header from "./components/Header";

import { CartProvider } from "./CartContext"; // 👈 import your context provider
import { useCart } from "./CartContext"; // 👈 to read cart count in header

function App() {
  const { cart } = useCart(); // 👈 get cart from context

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Header cartCount={cart.length} />}>
          <Route index element={<ProductList />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="cart" element={<Cart />} />
          <Route
            path="add"
            element={
              <Protected adminRequired={true}>
                <AddProduct />
              </Protected>
            }
          />
          <Route
            path="update/:id?"
            element={
              <Protected adminRequired={true}>
                <UpdateProduct />
              </Protected>
            }
          />
          <Route path="search" element={<SearchProduct />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <CartProvider>
    <App />
  </CartProvider>
);

reportWebVitals();
