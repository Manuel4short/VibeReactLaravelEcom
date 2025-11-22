import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProductList from "./Pages/ProductList";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import AddProduct from "./Pages/AddProduct";
import UpdateProduct from "./Pages/UpdateProduct";
import SearchProduct from "./Pages/SearchProduct";
import Cart from "./Pages/Cart";

import Protected from "./Pages/Protected";

import { CartProvider } from "./CartContext";

// ⭐ IMPORTANT: import the Layout you created
import Layout from "./components/Layout";
import "./components/App.css";

const App = () => (
  <CartProvider>
    <BrowserRouter>
      <Routes>
        {/* EVERYTHING goes inside Layout */}
        <Route path="/" element={<Layout />}>
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
  </CartProvider>
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

reportWebVitals();
