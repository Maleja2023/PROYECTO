import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Auth/Login/Login";
import Register from "../pages/Auth/Register/Register";
import Dashboard from "../pages/Dashboard/Dashboard";
import ProjectList from "../pages/Projects/ProjectList/ProjectList";
import ProjectDetail from "../pages/Projects/ProjectDetail/ProjectDetail";
import CreateProject from "../pages/Projects/CreateProject/CreateProject";
import UserManagement from "../pages/Admin/UserManagement/UserManagement";
import Reports from "../pages/Admin/Reports/Reports";
import NotFound from "../pages/Error/NotFound";

import PrivateRoute from "../components/PrivateRoute/PrivateRoute";
import { useAuthContext } from "../context/AuthContext";

const AppRouter = () => {
  const { currentUser } = useAuthContext();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={currentUser ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={currentUser ? <Navigate to="/dashboard" /> : <Register />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <PrivateRoute>
              <ProjectList />
            </PrivateRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <PrivateRoute>
              <ProjectDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/projects/create"
          element={
            <PrivateRoute>
              <CreateProject />
            </PrivateRoute>
          }
        />
        <Route
          path="/user-management"
          element={
            <PrivateRoute>
              <UserManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <Reports />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
