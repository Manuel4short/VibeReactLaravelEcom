// PopupContext.jsx
import { createContext, useContext, useState } from "react";

const PopupContext = createContext();

export const PopupProvider = ({ children }) => {
  const [popup, setPopup] = useState({ message: "", type: "success" });

  const showPopup = (message, type = "success") => {
    setPopup({ message, type });
    setTimeout(() => setPopup({ message: "", type: "success" }), 3000);
  };

  return (
    <PopupContext.Provider value={{ showPopup }}>
      {children}
      {popup.message && (
        <div
          className="popup"
          style={{
            position: "fixed",
            top: "50%", // vertical center
            left: "50%", // horizontal center
            transform: "translate(-50%, -50%)", // center both axes
            padding: "10px 20px",
            color: "#333",
            fontWeight: "bold",
            borderRadius: "5px",
            backgroundColor: popup.type === "error" ? "#f1b8b8" : "#b8f1c6",
            zIndex: 9999,
            textAlign: "center", // optional, for multi-line messages
          }}
        >
          {popup.message}
        </div>
      )}
    </PopupContext.Provider>
  );
};

export const usePopup = () => useContext(PopupContext);
