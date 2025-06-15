import React, { useState, useEffect } from 'react';
import AdminLayout from "../../components/admin/layout/AdminLayout";
import { getAdministradores, addAdministrador, updateAdministrador, deleteAdministrador, checkEmailExists } from '../../services/userService';
import Swal from 'sweetalert2';

export default function AdminAdministradores() {
  const [administradores, setAdministradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    tipo: 'admin'
  });

  const MAIN_ADMIN_UID = 'ID_DEL_ADMIN_PRINCIPAL'; // Reemplaza con el ID real

  const validations = {
    nombre: {
      minLength: 3,
      maxLength: 50,
      regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s-]+$/,
      message: "Solo letras, espacios y guiones (3-50 caracteres)"
    },
    email: {
      maxLocal: 64,
      maxDomain: 255,
      regex: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
      message: "Formato inválido (ej: usuario@dominio.com)"
    }
  };

  const fetchAdministradores = async () => {
    try {
      const data = await getAdministradores();
      setAdministradores(data);
    } catch (error) {
      Swal.fire('Error', 'Error al cargar administradores', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdministradores(); }, []);

  const validateEmail = async (email) => {
    if (!email) return "Email requerido";
    
    // Validación de formato estricto
    if (!validations.email.regex.test(email)) {
      return validations.email.message;
    }
    
    const [localPart, domainPart] = email.split('@');
    
    if (localPart.length > validations.email.maxLocal || 
        domainPart.length > validations.email.maxDomain) {
      return "Email demasiado largo";
    }
    
    try {
      const exists = await checkEmailExists(email);
      if (exists && (!isEditing || email !== currentAdmin?.email)) {
        return "Email ya registrado";
      }
      return null;
    } catch (error) {
      return "Error verificando email";
    }
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    
    let filteredValue = value;
    if (name === 'nombre') {
      // Filtra caracteres no permitidos y limita longitud
      filteredValue = value
        .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s-]/g, '')
        .slice(0, validations.nombre.maxLength);
    }
    else if (name === 'email' && !isEditing) {
      // Solo validar email si no está en modo edición
      filteredValue = value.toLowerCase().replace(/\s/g, '');
    }
    
    setFormData({...formData, [name]: filteredValue});
    
    // Validación en tiempo real
    if (name === 'email' && !isEditing) {
      setErrors({...errors, email: await validateEmail(filteredValue)});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar nombre (eliminando espacios vacíos)
    const nombreTrimmed = formData.nombre.trim();
    const nombreError = nombreTrimmed.length < validations.nombre.minLength ? 
                       validations.nombre.message : 
                       !validations.nombre.regex.test(nombreTrimmed) ?
                       "Caracteres no permitidos en el nombre" : null;
    
    // Validar email (solo si no está en modo edición)
    const emailError = isEditing ? null : await validateEmail(formData.email);
    
    setErrors({
      nombre: nombreError,
      email: emailError
    });

    if (nombreError || emailError) {
      Swal.fire({
        title: 'Errores en el formulario',
        html: [
          nombreError && `<b>Nombre:</b> ${nombreError}`,
          emailError && `<b>Email:</b> ${emailError}`
        ].filter(Boolean).join('<br>'),
        icon: 'error'
      });
      return;
    }

    try {
      const dataToSend = {
        nombre: nombreTrimmed, // Usamos el nombre trimmeado
        email: formData.email
      };

      if (isEditing) {
        await updateAdministrador(currentAdmin.id, dataToSend);
        Swal.fire('Éxito', 'Administrador actualizado', 'success');
      } else {
        await addAdministrador(dataToSend);
        Swal.fire('Éxito', 'Nuevo administrador registrado', 'success');
      }
      setShowModal(false);
      fetchAdministradores();
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const handleDelete = async (id, nombre) => {
    if (id === MAIN_ADMIN_UID) {
      Swal.fire('Error', 'No se puede eliminar al admin principal', 'error');
      return;
    }

    const result = await Swal.fire({
      title: '¿Eliminar administrador?',
      text: `Esta acción no se puede deshacer`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar'
    });

    if (result.isConfirmed) {
      try {
        await deleteAdministrador(id);
        Swal.fire('Éxito', `${nombre} eliminado`, 'success');
        fetchAdministradores();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar', 'error');
      }
    }
  };

  if (loading) return <AdminLayout><div>Cargando...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="container mt-5">
        <h2>Gestión de Administradores</h2>
        <button className="btn btn-success mb-3" onClick={() => {
          setIsEditing(false);
          setCurrentAdmin(null);
          setFormData({ nombre: '', email: '', tipo: 'admin' });
          setErrors({});
          setShowModal(true);
        }}>
          Agregar Administrador
        </button>

        {showModal && (
          <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {isEditing ? 'Editar Administrador' : 'Nuevo Administrador'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
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
                            nombre: trimmed.length < validations.nombre.minLength ? 
                                   validations.nombre.message : 
                                   !validations.nombre.regex.test(trimmed) ?
                                   "Caracteres no permitidos" : null
                          });
                        }}
                        required
                      />
                      {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                      <small className="text-muted">
                        {formData.nombre.trim().length}/{validations.nombre.maxLength} caracteres válidos
                      </small>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email*</label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="form-control-plaintext bg-light"
                          value={formData.email}
                          readOnly
                        />
                      ) : (
                        <>
                          <input
                            type="email"
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            onBlur={() => setErrors({...errors, email: validateEmail(formData.email)})}
                            required
                          />
                          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                          <small className="text-muted">
                            Ejemplo: admin@dominio.com
                          </small>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {isEditing ? 'Guardar' : 'Registrar'}
                    </button>
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
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {administradores.map(admin => (
                <tr key={admin.id}>
                  <td>{admin.nombre}</td>
                  <td>{admin.email}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => {
                        setIsEditing(true);
                        setCurrentAdmin(admin);
                        setFormData({ 
                          nombre: admin.nombre, 
                          email: admin.email, 
                          tipo: 'admin' 
                        });
                        setErrors({});
                        setShowModal(true);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(admin.id, admin.nombre)}
                      disabled={admin.id === MAIN_ADMIN_UID}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}