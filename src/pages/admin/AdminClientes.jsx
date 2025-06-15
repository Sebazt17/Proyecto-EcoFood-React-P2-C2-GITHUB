import React, { useState, useEffect } from 'react';
import AdminLayout from "../../components/admin/layout/AdminLayout";
import { getClientes, deleteCliente, registerClientWithAuth, updateCliente, checkEmailExists } from '../../services/userService';
import Swal from 'sweetalert2';
import { regionesComunas } from '../../data/regionesComunas';

export default function AdminClientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    repeatPassword: '',
    direccion: '',
    region: '',
    comuna: '',
    telefono: '',
    tipo: 'cliente'
  });

  const validations = {
    nombre: { minLength: 3, maxLength: 50, message: "Entre 3 y 50 caracteres" },
    direccion: { minLength: 5, maxLength: 100, message: "Entre 5 y 100 caracteres" },
    telefono: { minLength: 8, maxLength: 12, message: "8-12 dígitos" }
  };

  const fetchClientes = async () => {
    try {
      const data = await getClientes();
      setClientes(data);
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar los clientes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClientes(); }, []);

  const validatePassword = (password) => {
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    return password.length >= 6 && password.length <= 20 && hasNumber && hasLetter;
  };

  const validateEmail = async (email) => {
    if (!email) return "Email requerido";
    const [localPart, domainPart] = email.split('@');
    if (!localPart || !domainPart || domainPart.indexOf('.') === -1) return "Formato inválido (usuario@dominio.com)";
    if (localPart.length > 64 || domainPart.length > 255) return "Email demasiado largo";

    try {
      const exists = await checkEmailExists(email);
      if (exists && (!editingId || email !== formData.email)) return "Email ya registrado";
      return null;
    } catch {
      return "Error verificando email";
    }
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    let filteredValue = value;
    switch (name) {
      case 'nombre':
        filteredValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s-]/g, '').slice(0, validations.nombre.maxLength);
        break;
      case 'telefono':
        filteredValue = value.replace(/\D/g, '').slice(0, validations.telefono.maxLength);
        break;
      case 'email':
        filteredValue = value.toLowerCase().replace(/\s/g, '');
        break;
      case 'password':
        filteredValue = value.slice(0, 20);
        break;
      case 'direccion':
        filteredValue = value.slice(0, validations.direccion.maxLength);
        break;
    }

    setFormData(prev => ({ ...prev, [name]: filteredValue }));

    if (name === 'email') {
      setErrors({ ...errors, email: await validateEmail(filteredValue) });
    }
  };

  const handleRegionChange = (e) => {
    setFormData({ ...formData, region: e.target.value, comuna: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nombreValido = formData.nombre.trim().length >= validations.nombre.minLength;
    const direccionValida = !formData.direccion || (formData.direccion.trim().length >= validations.direccion.minLength);

    const newErrors = {
      nombre: !nombreValido ? validations.nombre.message : null,
      email: await validateEmail(formData.email),
      password: !editingId && !validatePassword(formData.password) ? "6-20 caracteres con números y letras" : null,
      repeatPassword: !editingId && formData.password !== formData.repeatPassword ? "Las contraseñas no coinciden" : null,
      direccion: formData.direccion && !direccionValida ? validations.direccion.message : null
    };

    setErrors(newErrors);
    const hasErrors = Object.values(newErrors).some(err => err !== null);
    if (hasErrors) {
      Swal.fire({
        title: 'Errores en el formulario',
        html: Object.entries(newErrors).filter(([_, error]) => error).map(([field, error]) => `<b>${field}:</b> ${error}`).join('<br>'),
        icon: 'error'
      });
      return;
    }

    try {
      const dataToSend = {
        nombre: formData.nombre.trim(),
        ...(formData.direccion && { direccion: formData.direccion.trim() }),
        region: formData.region,
        comuna: formData.comuna,
        telefono: formData.telefono
      };

      if (editingId) {
        await updateCliente(editingId, dataToSend);
        Swal.fire('¡Actualizado!', 'Cliente actualizado', 'success');
      } else {
        await registerClientWithAuth(formData.email, formData.password, dataToSend);
        Swal.fire('¡Registrado!', 'Nuevo cliente creado', 'success');
      }

      setShowModal(false);
      setEditingId(null);
      setFormData({
        nombre: '', email: '', password: '', repeatPassword: '',
        direccion: '', region: '', comuna: '', telefono: '', tipo: 'cliente'
      });
      fetchClientes();
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const handleDelete = async (id, email) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Eliminar al cliente ${email}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar'
    });

    if (result.isConfirmed) {
      try {
        await deleteCliente(id);
        Swal.fire('Eliminado', 'Cliente eliminado', 'success');
        fetchClientes();
      } catch {
        Swal.fire('Error', 'No se pudo eliminar', 'error');
      }
    }
  };

  const handleEdit = (cliente) => {
    setEditingId(cliente.id);
    setFormData({
      nombre: cliente.nombre,
      email: cliente.email,
      password: '', repeatPassword: '',
      direccion: cliente.direccion || '',
      region: cliente.region || '',
      comuna: cliente.comuna || '',
      telefono: cliente.telefono || '',
      tipo: 'cliente'
    });
    setShowModal(true);
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
        <button className="btn btn-success mb-3" onClick={() => {
          setShowModal(true);
          setEditingId(null);
          setFormData({
            nombre: '', email: '', password: '', repeatPassword: '',
            direccion: '', region: '', comuna: '', telefono: '', tipo: 'cliente'
          });
        }}>
          Agregar Nuevo Cliente
        </button>

        {showModal && (
          <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editingId ? 'Editar Cliente' : 'Agregar Cliente'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Nombre*</label>
                          <input
                            type="text"
                            className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            onBlur={(e) => {
                              const trimmed = e.target.value.trim();
                              if (trimmed !== e.target.value) {
                                setFormData({...formData, nombre: trimmed});
                              }
                              setErrors({
                                ...errors, 
                                nombre: trimmed.length < validations.nombre.minLength ? validations.nombre.message : null
                              });
                            }}
                            required
                          />
                          {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                          <small className="text-muted">{formData.nombre.trim().length}/{validations.nombre.maxLength} caracteres (sin espacios)</small>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Email*</label>
                          <input
                            type="email"
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={!!editingId}
                            required
                          />
                          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                        </div>

                        {!editingId && (
                          <>
                            <div className="mb-3">
                              <label className="form-label">Contraseña*</label>
                              <input
                                type="password"
                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                              />
                              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                            </div>

                            <div className="mb-3">
                              <label className="form-label">Repetir Contraseña*</label>
                              <input
                                type="password"
                                className={`form-control ${errors.repeatPassword ? 'is-invalid' : ''}`}
                                name="repeatPassword"
                                value={formData.repeatPassword}
                                onChange={handleInputChange}
                                required
                              />
                              {errors.repeatPassword && <div className="invalid-feedback">{errors.repeatPassword}</div>}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Dirección</label>
                          <input
                            type="text"
                            className={`form-control ${errors.direccion ? 'is-invalid' : ''}`}
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleInputChange}
                            onBlur={(e) => {
                              const trimmed = e.target.value.trim();
                              if (trimmed !== e.target.value) {
                                setFormData({...formData, direccion: trimmed});
                              }
                              setErrors({
                                ...errors, 
                                direccion: trimmed && (trimmed.length < validations.direccion.minLength || trimmed.length > validations.direccion.maxLength) ? validations.direccion.message : null
                              });
                            }}
                          />
                          {errors.direccion && <div className="invalid-feedback">{errors.direccion}</div>}
                          <small className="text-muted">{formData.direccion.trim().length}/{validations.direccion.maxLength} caracteres (sin espacios)</small>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Región</label>
                          <select className="form-select" value={formData.region} onChange={handleRegionChange}>
                            <option value="">Selecciona región</option>
                            {Object.keys(regionesComunas).map(region => (
                              <option key={region} value={region}>{region}</option>
                            ))}
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Comuna</label>
                          <select className="form-select" value={formData.comuna} onChange={(e) => setFormData({...formData, comuna: e.target.value})} disabled={!formData.region}>
                            <option value="">{formData.region ? "Selecciona comuna" : "Primero elige una región"}</option>
                            {formData.region && regionesComunas[formData.region].map(comuna => (
                              <option key={comuna} value={comuna}>{comuna}</option>
                            ))}
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Teléfono</label>
                          <input type="text" className={`form-control ${errors.telefono ? 'is-invalid' : ''}`} name="telefono" value={formData.telefono} onChange={handleInputChange} />
                          {errors.telefono && <div className="invalid-feedback">{errors.telefono}</div>}
                          <small className="text-muted">{formData.telefono.length}/{validations.telefono.maxLength} dígitos</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary">{editingId ? 'Guardar Cambios' : 'Registrar'}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Región</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 ? (
                <tr><td colSpan="5" className="text-center">No hay clientes</td></tr>
              ) : (
                clientes.map(cliente => (
                  <tr key={cliente.id}>
                    <td>{cliente.nombre}</td>
                    <td>{cliente.email}</td>
                    <td>{cliente.telefono || 'N/A'}</td>
                    <td>{cliente.region || 'N/A'}</td>
                    <td>
                      <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(cliente)}>Editar</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(cliente.id, cliente.email)}>Eliminar</button>
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
