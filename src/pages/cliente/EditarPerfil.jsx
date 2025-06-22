// src/pages/cliente/EditarPerfil.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateUserData } from '../../services/userService';
import Swal from 'sweetalert2';

export default function EditarPerfil() {
  const { userData, logout } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    comuna: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData) {
      setFormData({
        nombre: userData.nombre || '',
        direccion: userData.direccion || '',
        comuna: userData.comuna || ''
      });
      setLoading(false);
    }
  }, [userData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserData(userData.uid, formData);
      Swal.fire({
        title: '¡Éxito!',
        text: 'Tu perfil ha sido actualizado correctamente',
        icon: 'success'
      });
      // Forzar actualización de los datos de usuario
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar el perfil',
        icon: 'error'
      });
      console.error('Error al actualizar perfil:', error);
    }
  };

  if (loading) return <div className="container mt-4">Cargando...</div>;

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-body">
          <h2 className="card-title mb-4">Editar Perfil</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nombre Completo</label>
              <input
                type="text"
                className="form-control"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Dirección</label>
              <input
                type="text"
                className="form-control"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Comuna</label>
              <input
                type="text"
                className="form-control"
                name="comuna"
                value={formData.comuna}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="d-grid gap-2">
              <button type="submit" className="btn btn-primary">
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}