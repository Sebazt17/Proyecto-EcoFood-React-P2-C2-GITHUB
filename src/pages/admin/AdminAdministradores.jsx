// src/pages/admin/AdminAdministradores.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from "../../components/admin/layout/AdminLayout";
import { getAdministradores, addAdministrador, updateAdministrador, deleteAdministrador } from '../../services/userService'; // Importar de userService
import Swal from 'sweetalert2';

export default function AdminAdministradores() {
  const [administradores, setAdministradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    // No pedir contraseña aquí, la creación de cuenta Auth para admin debería ser por otro flujo o Cloud Functions
    // Para simplificar, estamos asumiendo que solo se manejan los datos en Firestore.
    // Si necesitas crear cuentas de Auth para admins, el proceso sería similar a `registerClientWithAuth`
    // pero con un flujo de seguridad más robusto.
    tipo: 'admin'
  });

  // ID del administrador principal (configurable)
  // DEBES REEMPLAZAR 'ID_DEL_ADMIN_PRINCIPAL_AQUI' con el UID real del administrador que no se puede eliminar.
  const MAIN_ADMIN_UID = 'ID_DEL_ADMIN_PRINCIPAL_AQUI'; // ¡CAMBIA ESTO!

  const fetchAdministradores = async () => {
    try {
      const data = await getAdministradores();
      setAdministradores(data);
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar los administradores.', 'error');
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdministradores();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentAdmin(null);
    setFormData({ nombre: '', email: '', tipo: 'admin' });
    setShowModal(true);
  };

  const handleOpenEditModal = (admin) => {
    setIsEditing(true);
    setCurrentAdmin(admin);
    setFormData({ ...admin });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateAdministrador(currentAdmin.id, formData);
        Swal.fire('Actualizado', 'Administrador actualizado correctamente.', 'success');
      } else {
        await addAdministrador(formData); // Esto solo guarda en Firestore, no crea cuenta Auth
        Swal.fire('Agregado', 'Administrador agregado correctamente (solo en Firestore).', 'success');
      }
      setShowModal(false);
      fetchAdministradores(); // Recargar la lista
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar el administrador.', 'error');
      console.error('Error saving admin:', error);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (id === MAIN_ADMIN_UID) {
      Swal.fire('Acceso Denegado', 'No se puede eliminar al administrador principal.', 'error');
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: `Estás a punto de eliminar al administrador: ${nombre}. Esta acción es irreversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteAdministrador(id);
          // TODO: Para una eliminación completa, también deberías eliminar la cuenta de Firebase Auth.
          // Esto usualmente requiere el SDK Admin de Firebase o Cloud Functions.
          Swal.fire('Eliminado', 'El administrador ha sido eliminado.', 'success');
          fetchAdministradores();
        } catch (error) {
          Swal.fire('Error', 'No se pudo eliminar el administrador.', 'error');
          console.error('Error deleting admin:', error);
        }
      }
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="container mt-5">
          <h2>Gestión de Administradores</h2>
          <div>Cargando administradores...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mt-5">
        <h2>Gestión de Administradores</h2>
        <button className="btn btn-success mb-3" onClick={handleOpenAddModal}>
          Agregar Nuevo Administrador
        </button>

        {/* Modal para agregar/editar administrador */}
        {showModal && (
          <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{isEditing ? 'Editar Administrador' : 'Agregar Nuevo Administrador'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label htmlFor="nombre" className="form-label">Nombre</label>
                      <input type="text" className="form-control" id="nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleInputChange} required />
                    </div>
                    {/* Nota: La creación de cuentas de autenticación para administradores debería ser un proceso más seguro.
                        Aquí solo estamos guardando los datos en Firestore. */}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cerrar</button>
                    <button type="submit" className="btn btn-primary">{isEditing ? 'Actualizar' : 'Agregar'}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {administradores.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center">No hay administradores registrados.</td>
                </tr>
              ) : (
                administradores.map((admin) => (
                  <tr key={admin.id}>
                    <td>{admin.id}</td>
                    <td>{admin.nombre}</td>
                    <td>{admin.email}</td>
                    <td>
                      <button className="btn btn-sm btn-warning me-2" onClick={() => handleOpenEditModal(admin)}>Editar</button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(admin.id, admin.nombre)}
                        disabled={admin.id === MAIN_ADMIN_UID} // Deshabilita el botón si es el admin principal
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}