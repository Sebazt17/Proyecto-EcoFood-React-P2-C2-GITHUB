import React, { useState, useEffect } from 'react';
import { getEmpresas, addEmpresa, updateEmpresa, deleteEmpresa } from '../../services/userService';
import Swal from 'sweetalert2';
import AdminLayout from '../../components/admin/layout/AdminLayout';

export default function AdminEmpresas() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEmpresa, setCurrentEmpresa] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    direccion: '',
    comuna: '',
    email: '',
    telefono: ''
  });

  const fetchEmpresas = async () => {
    try {
      const data = await getEmpresas();
      setEmpresas(data);
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar las empresas.', 'error');
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentEmpresa(null);
    setFormData({ nombre: '', rut: '', direccion: '', comuna: '', email: '', telefono: '' });
    setShowModal(true);
  };

  const handleOpenEditModal = (empresa) => {
    setIsEditing(true);
    setCurrentEmpresa(empresa);
    setFormData({ ...empresa });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateEmpresa(currentEmpresa.id, formData);
        Swal.fire('Actualizado', 'Empresa actualizada correctamente.', 'success');
      } else {
        await addEmpresa(formData);
        Swal.fire('Agregado', 'Empresa agregada correctamente.', 'success');
      }
      setShowModal(false);
      fetchEmpresas();
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar la empresa.', 'error');
      console.error('Error saving company:', error);
    }
  };

  const handleDelete = async (id, nombre) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Estás a punto de eliminar la empresa: ${nombre}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteEmpresa(id);
          Swal.fire('Eliminado', 'La empresa ha sido eliminada.', 'success');
          fetchEmpresas();
        } catch (error) {
          Swal.fire('Error', 'No se pudo eliminar la empresa.', 'error');
          console.error('Error deleting company:', error);
        }
      }
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="container mt-5">
          <h2>Gestión de Empresas</h2>
          <div>Cargando empresas...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mt-5">
        <h2>Gestión de Empresas</h2>
        <button className="btn btn-success mb-3" onClick={handleOpenAddModal}>
          Agregar Nueva Empresa
        </button>

        {/* Modal de Empresa */}
        {showModal && (
          <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{isEditing ? 'Editar Empresa' : 'Agregar Empresa'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Nombre*</label>
                      <input type="text" className="form-control" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">RUT*</label>
                      <input type="text" className="form-control" name="rut" value={formData.rut} onChange={handleInputChange} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Dirección*</label>
                      <input type="text" className="form-control" name="direccion" value={formData.direccion} onChange={handleInputChange} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Comuna*</label>
                      <input type="text" className="form-control" name="comuna" value={formData.comuna} onChange={handleInputChange} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email*</label>
                      <input type="email" className="form-control" name="email" value={formData.email} onChange={handleInputChange} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Teléfono</label>
                      <input type="text" className="form-control" name="telefono" value={formData.telefono} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary">{isEditing ? 'Actualizar' : 'Guardar'}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de Empresas */}
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>RUT</th>
                <th>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empresas.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center">No hay empresas registradas</td>
                </tr>
              ) : (
                empresas.map(empresa => (
                  <tr key={empresa.id}>
                    <td>{empresa.nombre}</td>
                    <td>{empresa.rut}</td>
                    <td>{empresa.email}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleOpenEditModal(empresa)}
                      >
                        Editar
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(empresa.id, empresa.nombre)}
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