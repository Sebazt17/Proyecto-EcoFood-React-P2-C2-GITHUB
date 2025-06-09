// src/pages/cliente/ClientDashboard.jsx
import React from 'react';
import CerrarSesion from '../../components/CerrarSesion'; 

export default function ClientDashboard() {
  return (
    <div className="container mt-5">
      <h2>Bienvenido Cliente</h2>
      <p>Este es tu panel de cliente en EcoFood. Pronto podrás ver tus pedidos y más.</p>
      <CerrarSesion />
    </div>
  );
}
