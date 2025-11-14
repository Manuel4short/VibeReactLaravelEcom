import { Navigate } from "react-router-dom";

const Protected = ({ adminRequired, children }) => {
  // safely parse localStorage value
  const user = JSON.parse(localStorage.getItem("user-info") || "null");

  // condition check
  if (
    !user || // if no user in localStorage
    (adminRequired && user.role.toLowerCase() !== "admin") // if admin required but user isn’t admin
  ) {
    return <Navigate to="/" />;
  }

  return children;
};

export default Protected;
