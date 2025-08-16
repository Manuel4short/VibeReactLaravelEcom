import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPopup, setShowPopup] = useState(false); // State for pop-up visibility
  const [message, setMessage] = useState(""); // State for pop-up message
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("user-info")) {
      navigate("/add");
    }
  }, [navigate]);

  async function signUp() {
    let item = { name, password, email };
    console.log(item);

    let result = await fetch("http://127.0.0.1:8000/api/register", {
      method: "POST",
      body: JSON.stringify(item),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    result = await result.json();

    if (result) {
      // Check if registration is successful
      setMessage("Registration successful!");
      setShowPopup(true); // Show the pop-up
      localStorage.setItem("user-info", JSON.stringify(result));
      setTimeout(() => {
        setShowPopup(false); // Hide the pop-up after 3 seconds
        navigate("/add"); // Navigate to another page
      }, 3000);
    }
  }

  return (
    <>
      <div className="login col-sm-6 offset-sm-3" style={{ color: "green" }}>
        <h1 style={{ textAlign: "center" }}>Register page</h1>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="form-control"
          placeholder="name"
        />{" "}
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

      {/* Pop-up for success message */}
      {showPopup && (
        <div className="popup" style={popupStyles}>
          <p>{message}</p>
        </div>
      )}
    </>
  );
}

// Pop-up styling
const popupStyles = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "white",
  padding: "20px",
  boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
  zIndex: 1000,
  textAlign: "center",
};

export default Register;
