// src/pages/cliente/HomeCliente.jsx
import { Link } from 'react-router-dom';
import CerrarSesion from '../../components/CerrarSesion';

export default function HomeCliente() {
  return (
    <div className="container mt-5 text-center">
      <h2>Bienvenido Cliente</h2>
      <div className="d-grid gap-3 col-md-6 mx-auto mt-4">
        <Link to="/cliente/productos" className="btn btn-primary btn-lg">
          Ver Productos Disponibles
        </Link>
        <Link to="/cliente/pedidos" className="btn btn-secondary btn-lg">
          Mis Pedidos
        </Link>
        <Link to="/cliente/editar-perfil" className="btn btn-outline-dark btn-lg">
          Editar Perfil
        </Link>
      </div>
      <CerrarSesion className="mt-5" />
    </div>
  );
}