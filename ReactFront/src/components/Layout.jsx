// components/Layout.js
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import { useCart } from "../Contexts/CartContext";
import { usePopup } from "../Contexts/PopupContext";

export default function Layout() {
  const { cart } = useCart(); // ← get cart here
  const { showPopup } = usePopup();

  useEffect(() => {
    showPopup("App loaded");
  }, []);

  return (
    <div className="App min-vh-100 d-flex flex-column">
      {/* Header stays at the top */}
      <Header cartCount={cart.length} />

      {/* Main content grows to fill space */}
      <main className="flex-grow-1 container py-4">
        <Outlet />
      </main>

      {/* Sticky footer */}
      <footer className="mt-auto p-3 bg-light d-flex justify-content-between">
        <span>© 2025 Prime Store </span>
        <span>wasap: +2349027673744</span>
      </footer>
    </div>
  );
}
