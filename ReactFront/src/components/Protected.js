import { Navigate } from "react-router-dom";


const Protected = ({ adminRequired, children }) => {
  const user = JSON.parse(localStorage.getItem("user-info"));

  if (!user || (adminRequired && user.role !== "admin")) {
    return <Navigate to="/" />;
  }

  return children;
};



export default Protected;
