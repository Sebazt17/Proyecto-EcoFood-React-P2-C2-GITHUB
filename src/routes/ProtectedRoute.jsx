import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, userData, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>; 
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Si se requiere un rol específico, verificarlo
  if (requiredRole && (!userData || userData.tipo !== requiredRole)) {
    return <Navigate to="/login" />; 
  }

  return children;
}