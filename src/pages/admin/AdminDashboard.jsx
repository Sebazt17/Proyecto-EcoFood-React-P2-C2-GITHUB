// src/pages/admin/AdminDashboard.jsx
import React from 'react';
import AdminLayout from "../../components/admin/layout/AdminLayout";

export default function AdminDashboard() {
    return (
        <AdminLayout>
        <div className="container mt-5">
            <h2>Panel del Administrador</h2>
            <p>Bienvenido al panel de administración de EcoFood. Desde aquí puedes gestionar empresas, clientes y otros administradores.</p>
        </div>
        </AdminLayout>
    );
}