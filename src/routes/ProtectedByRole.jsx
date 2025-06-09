// src/routes/ProtectedByRole.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

export default function ProtectedByRole({ allowedRoles, children }) {
  const { userData, loading } = useAuth();

  if (loading) return <div className="text-center mt-5">Verificando permisos...</div>;
  
  if (!userData) {
    Swal.fire({
      title: "Acceso restringido",
      text: "Debes iniciar sesión para acceder a esta página",
      icon: "warning"
    });
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userData.tipo)) {
    Swal.fire({
      title: "Permisos insuficientes",
      text: "No tienes permisos para acceder a esta sección",
      icon: "error"
    });
    return <Navigate to="/" replace />;
  }

  return children;
}