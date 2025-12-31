import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePopup } from "../Contexts/PopupContext";

function Register() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { showPopup } = usePopup();

  useEffect(() => {
    if (localStorage.getItem("user-info")) {
      navigate("/add");
    }
  }, [navigate]);

  async function signUp() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/register`, {
        method: "POST",
        body: JSON.stringify({ name, password, email }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const result = await res.json();

      if (!res.ok) {
        showPopup(result.message || "Registration failed", "error");
        return;
      }

      showPopup("Registration successful!");
      localStorage.setItem("user-info", JSON.stringify(result));

      setTimeout(() => navigate("/add"), 1500);
    } catch (err) {
      showPopup("Something went wrong. Try again.", "error");
    }
  }

  return (
    <div className="login col-sm-6 offset-sm-3">
      <h1 style={{ textAlign: "center" }}>Register page</h1>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="form-control"
        placeholder="name"
      />
      <br />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="form-control"
        placeholder="password"
      />
      <br />
      <input
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="form-control"
        placeholder="email"
      />
      <br />
      <button onClick={signUp} className="btn btn-primary offset-5">
        Submit
      </button>
    </div>
  );
}

export default Register;
