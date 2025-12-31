import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
// import "./components/App.css";
import { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import Layout from "./components/Layout";
import Protected from "./Pages/Protected";
import { CartProvider } from "./Contexts/CartContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PopupProvider } from "./Contexts/PopupContext";
const ProductList = lazy(() => import("./Pages/ProductList.jsx"));
const Cart = lazy(() => import("./Pages/Cart.jsx"));
const Login = lazy(() => import("./Pages/Login.jsx"));
const Register = lazy(() => import("./Pages/Register.jsx"));
const AddProduct = lazy(() => import("./Pages/AddProduct.jsx"));
const UpdateProduct = lazy(() => import("./Pages/UpdateProduct.jsx"));
const SearchProduct = lazy(() => import("./Pages/SearchProduct.jsx"));
const DeleteProducts = lazy(() => import("./Pages/DeleteProducts.jsx"));

const App = () => (
  <PopupProvider>
    <CartProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="text-center py-5">Loading...</div>}>
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
              <Route
                path="delete"
                element={
                  <Protected adminRequired={true}>
                    <DeleteProducts />
                  </Protected>
                }
              />

              <Route path="search" element={<SearchProduct />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </CartProvider>
  </PopupProvider>
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
