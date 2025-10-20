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
import { CartProvider, useCart } from "./CartContext";
import { Outlet } from "react-router-dom";

const HeaderWithCart = () => {
  const { cart } = useCart();
  return (
    <>
      <Header cartCount={cart.length} />
    </>
  );
};

const App = () => (
  <CartProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HeaderWithCart />}>
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
