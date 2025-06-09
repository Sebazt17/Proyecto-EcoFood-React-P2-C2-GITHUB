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
import ClienteDashboard from '../pages/cliente/ClienteDashboard';
import PerfilEmpresa from '../pages/empresa/PerfilEmpresa';
import ProductsEmpresa from '../pages/empresa/ProductsEmpresa';

export default function AppRouter() {
  return (
    <Routes>
      {/* Redirige la ruta raíz directamente al login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/registro-empresa" element={<RegisterEmpresa />} />
      <Route path="/recuperar-contrasena" element={<ForgotPassword />} />

      {/* Rutas protegidas - SIN ANIDACIÓN */}
      <Route path="/home" element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
      
      {/* Rutas de cliente */}
      <Route path="/cliente/dashboard" element={
        <ProtectedByRole allowedRoles={['cliente']}>
          <ClienteDashboard />
        </ProtectedByRole>
      } />
      
      {/* Rutas de empresa */}
      <Route path="/empresa/perfil" element={
        <ProtectedByRole allowedRoles={['empresa']}>
          <PerfilEmpresa />
        </ProtectedByRole>
      } />
      <Route path="/empresa/productos" element={
        <ProtectedByRole allowedRoles={['empresa']}>
          <ProductsEmpresa />
        </ProtectedByRole>
      } />
      
      {/* Rutas de admin - ESTRUCTURA PLANA */}
      <Route path="/admin/dashboard" element={
        <ProtectedByRole allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedByRole>
      } />
      <Route path="/admin/empresas" element={
        <ProtectedByRole allowedRoles={['admin']}>
          <AdminEmpresas />
        </ProtectedByRole>
      } />
      <Route path="/admin/clientes" element={
        <ProtectedByRole allowedRoles={['admin']}>
          <AdminClientes />
        </ProtectedByRole>
      } />
      <Route path="/admin/administradores" element={
        <ProtectedByRole allowedRoles={['admin']}>
          <AdminAdministradores />
        </ProtectedByRole>
      } />
    </Routes>
  );
}