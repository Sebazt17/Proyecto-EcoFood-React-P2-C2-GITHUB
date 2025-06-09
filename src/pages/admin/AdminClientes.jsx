import React, { useState, useEffect, useContext } from 'react';
import AdminLayout from "../../components/admin/layout/AdminLayout";
import { getClientes, deleteCliente, registerClientWithAuth, updateCliente } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

export default function AdminClientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newClientData, setNewClientData] = useState({
    nombre: '',
    email: '',
    password: '',
    direccion: '',
    comuna: '',
    telefono: '',
    tipo: 'cliente'
  });
  const { userData } = useAuth();

  const fetchClientes = async () => {
    try {
      const data = await getClientes();
      setClientes(data);
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar los clientes.', 'error');
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleDelete = async (id, email) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Estás a punto de eliminar al cliente ${email}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteCliente(id);
        Swal.fire('Eliminado', 'El cliente ha sido eliminado.', 'success');
        fetchClientes();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar el cliente.', 'error');
        console.error('Error deleting client:', error);
      }
    }
  };

  const handleEdit = (cliente) => {
    setEditingId(cliente.id);
    setNewClientData({
      nombre: cliente.nombre,
      email: cliente.email,
      password: '', // No mostramos la contraseña
      direccion: cliente.direccion || '',
      comuna: cliente.comuna || '',
      telefono: cliente.telefono || '',
      tipo: cliente.tipo || 'cliente'
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClientData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        // Modo edición
        await updateCliente(editingId, {
          nombre: newClientData.nombre,
          direccion: newClientData.direccion,
          comuna: newClientData.comuna,
          telefono: newClientData.telefono
        });
        Swal.fire('¡Actualizado!', 'El cliente se actualizó correctamente', 'success');
      } else {
        // Modo creación
        await registerClientWithAuth(
          newClientData.email,
          newClientData.password,
          {
            nombre: newClientData.nombre,
            direccion: newClientData.direccion,
            comuna: newClientData.comuna,
            telefono: newClientData.telefono,
            tipo: 'cliente'
          }
        );
        Swal.fire('¡Registrado!', 'Nuevo cliente creado', 'success');
      }

      setShowModal(false);
      setEditingId(null);
      setNewClientData({
        nombre: '', email: '', password: '',
        direccion: '', comuna: '', telefono: '',
        tipo: 'cliente'
      });
      fetchClientes();
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="container mt-5">
          <h2>Gestión de Clientes</h2>
          <div>Cargando clientes...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mt-5">
        <h2>Gestión de Clientes</h2>
        <button className="btn btn-success mb-3" onClick={() => setShowModal(true)}>
          Agregar Nuevo Cliente
        </button>

        {/* Modal para agregar/editar cliente */}
        {showModal && (
          <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingId ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                  }}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Nombre*</label>
                      <input
                        type="text"
                        className="form-control"
                        name="nombre"
                        value={newClientData.nombre}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    {!editingId && (
                      <>
                        <div className="mb-3">
                          <label className="form-label">Email*</label>
                          <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={newClientData.email}
                            onChange={handleInputChange}
                            required
                            disabled={!!editingId}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Contraseña*</label>
                          <input
                            type="password"
                            className="form-control"
                            name="password"
                            value={newClientData.password}
                            onChange={handleInputChange}
                            required={!editingId}
                            minLength="6"
                          />
                        </div>
                      </>
                    )}

                    <div className="mb-3">
                      <label className="form-label">Dirección</label>
                      <input
                        type="text"
                        className="form-control"
                        name="direccion"
                        value={newClientData.direccion}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Comuna</label>
                      <input
                        type="text"
                        className="form-control"
                        name="comuna"
                        value={newClientData.comuna}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Teléfono</label>
                      <input
                        type="text"
                        className="form-control"
                        name="telefono"
                        value={newClientData.telefono}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => {
                      setShowModal(false);
                      setEditingId(null);
                    }}>Cancelar</button>
                    <button type="submit" className="btn btn-primary">
                      {editingId ? 'Guardar Cambios' : 'Registrar Cliente'}
                    </button>
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
                <th>Nombre</th>
                <th>Email</th>
                <th>Dirección</th>
                <th>Comuna</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">No hay clientes registrados.</td>
                </tr>
              ) : (
                clientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>{cliente.nombre}</td>
                    <td>{cliente.email}</td>
                    <td>{cliente.direccion || 'N/A'}</td>
                    <td>{cliente.comuna || 'N/A'}</td>
                    <td>{cliente.telefono || 'N/A'}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEdit(cliente)}
                      >
                        Editar
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(cliente.id, cliente.email)}
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