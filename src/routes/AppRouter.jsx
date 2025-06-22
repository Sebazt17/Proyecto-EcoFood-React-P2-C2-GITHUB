import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import RegisterEmpresa from '../pages/RegisterEmpresa';
import ForgotPassword from '../pages/ForgotPassword';
import ProtectedRoute from './ProtectedRoute';
import ProtectedByRole from './ProtectedByRole';
import Home from '../pages/Home';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminEmpresas from '../pages/admin/AdminEmpresas';
import AdminClientes from '../pages/admin/AdminClientes';
import AdminAdministradores from '../pages/admin/AdminAdministradores';
import HomeCliente from '../pages/cliente/HomeCliente';
import VerProductos from '../pages/cliente/VerProductos';
import MisPedidos from '../pages/cliente/MisPedidos';
import EditarPerfil from '../pages/cliente/EditarPerfil';
import PerfilEmpresa from '../pages/empresa/PerfilEmpresa';
import ProductsEmpresa from '../pages/empresa/ProductsEmpresa';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/registro-empresa" element={<RegisterEmpresa />} />
      <Route path="/recuperar-contrasena" element={<ForgotPassword />} />

      {/* Rutas protegidas */}
      <Route path="/home" element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
      
      {/* Rutas de cliente */}
      <Route path="/cliente/dashboard" element={
        <ProtectedByRole allowedRoles={['cliente']}>
          <HomeCliente />
        </ProtectedByRole>
      } />
      <Route path="/cliente/productos" element={
        <ProtectedByRole allowedRoles={['cliente']}>
          <VerProductos />
        </ProtectedByRole>
      } />
      <Route path="/cliente/pedidos" element={
        <ProtectedByRole allowedRoles={['cliente']}>
          <MisPedidos />
        </ProtectedByRole>
      } />
      <Route path="/cliente/editar-perfil" element={
        <ProtectedByRole allowedRoles={['cliente']}>
          <EditarPerfil />
        </ProtectedByRole>
      } />
      
      {/* Rutas de empresa y admin (mantenidas igual)... */}
    </Routes>
  );
}