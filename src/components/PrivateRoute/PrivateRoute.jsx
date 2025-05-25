
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuthContext();
  return currentUser ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
