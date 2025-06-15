import React, { useState, useEffect } from 'react';
import { getEmpresas, addEmpresa, updateEmpresa, deleteEmpresa, checkEmailExists  } from '../../services/userService';
import Swal from 'sweetalert2';
import AdminLayout from '../../components/admin/layout/AdminLayout';
import { regionesComunas } from '../../data/regionesComunas';

export default function AdminEmpresas() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEmpresa, setCurrentEmpresa] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [emailTimeout, setEmailTimeout] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    direccion: '',
    region: '',
    comuna: '',
    email: '',
    telefono: ''
  });
  const [errors, setErrors] = useState({});

  // Validaciones
  const validations = {
    nombre: {
      minLength: 3,
      maxLength: 50,
      message: "El nombre debe tener entre 3 y 50 caracteres"
    },
    rut: {
      pattern: /^[0-9]{7,8}-[0-9kK]{1}$/,
      message: "RUT inválido (Formato: 12345678-5)"
    },
    direccion: {
      minLength: 5,
      maxLength: 50,
      message: "La dirección debe tener entre 5 y 50 caracteres"
    },
    telefono: {
      pattern: /^[0-9]{8,12}$/,
      message: "Teléfono debe tener 8-12 dígitos"
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Email inválido"
    }
  };

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

// Modificaremos la función validateField para ser más estricta
const validateField = (name, value) => {
  const validation = validations[name];
  if (!validation) return true;

  // Validar que no sea solo espacios en blanco
  if (typeof value === 'string' && !value.trim()) return false;

  // Validaciones específicas
  if (name === 'nombre') {
    return value.trim().length >= validation.minLength && 
           value.trim().length <= validation.maxLength;
  }

  if (name === 'rut') {
    if (!validation.pattern.test(value)) return false;
    // Validar dígito verificador (opcional)
    // Puedes implementar algoritmo chileno aquí
    return true;
  }

  if (name === 'email') {
    return validation.pattern.test(value) && 
           value.includes('@') && 
           value.split('@')[1].includes('.');
  }

  // Validación genérica
  if (validation.minLength && value.length < validation.minLength) return false;
  if (validation.maxLength && value.length > validation.maxLength) return false;
  if (validation.pattern && !validation.pattern.test(value)) return false;

  return true;
};

  const handleRutChange = (e) => {
    let value = e.target.value
      .replace(/[^0-9kK-]/g, '')
      .toUpperCase();
    
    // Auto-formato RUT (12345678-5)
    if (value.length > 8 && !value.includes('-')) {
      value = `${value.slice(0, 8)}-${value.slice(8)}`;
    }
    
    setFormData({...formData, rut: value});
    setErrors({...errors, rut: !validateField('rut', value) ? validations.rut.message : null});
  };

  const handleTelefonoChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setFormData({...formData, telefono: value});
    setErrors({...errors, telefono: !validateField('telefono', value) ? validations.telefono.message : null});
  };

  const handleRegionChange = (e) => {
    setFormData({
      ...formData, 
      region: e.target.value,
      comuna: ""
    });
  };

  const validateEmail = async (email) => {
    if (!email) {
      setEmailError('Email es requerido');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Formato de email inválido');
      return false;
    }
    
    try {
      const exists = await checkEmailExists(email);
      if (exists && (!isEditing || email !== currentEmpresa?.email)) {
        setEmailError('Este email ya está registrado');
        return false;
      }
      setEmailError(null);
      return true;
    } catch (error) {
      setEmailError('Error verificando email');
      return false;
    }
  };

const handleInputChange = async (e) => {
  const { name, value } = e.target;
  
  // No permitir espacios al inicio
  if (value.startsWith(' ')) return;

  let filteredValue = value;

  // Filtros específicos por campo
  switch(name) {
    case 'nombre':
      filteredValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/g, '');
      break;
    
    case 'direccion':
      filteredValue = value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,#\-/]/g, '');
      break;
    
    case 'rut':
      handleRutChange(e);
      return;
    
    case 'telefono':
      filteredValue = value.replace(/\D/g, '');
      break;
    
    case 'email':
      filteredValue = value.replace(/\s/g, '').toLowerCase();
      // Validación con debounce para evitar muchas consultas
      clearTimeout(emailTimeout);
      setEmailTimeout(
        setTimeout(async () => {
          await validateEmail(filteredValue);
        }, 500)
      );
      break;
    
    default:
      filteredValue = value;
  }

  // Actualizar estado
  setFormData(prev => ({ 
    ...prev, 
    [name]: filteredValue 
  }));

  // Validación en tiempo real (excepto para email)
  if (validations[name] && name !== 'email') {
    setErrors({
      ...errors, 
      [name]: !validateField(name, filteredValue) ? validations[name].message : null
    });
  }
};

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentEmpresa(null);
    setFormData({ 
      nombre: '', 
      rut: '', 
      direccion: '', 
      region: '', 
      comuna: '', 
      email: '', 
      telefono: '' 
    });
    setErrors({});
    setShowModal(true);
  };

  const handleOpenEditModal = (empresa) => {
    setIsEditing(true);
    setCurrentEmpresa(empresa);
    setFormData({ 
      nombre: empresa.nombre,
      rut: empresa.rut,
      direccion: empresa.direccion,
      region: empresa.region || '',
      comuna: empresa.comuna || '',
      email: empresa.email,
      telefono: empresa.telefono || ''
    });
    setErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validations).forEach(key => {
      if (!validateField(key, formData[key])) {
        newErrors[key] = validations[key].message;
        isValid = false;
      }
    });

    // Validaciones adicionales
    if (!formData.region) {
      newErrors.region = "Selecciona una región";
      isValid = false;
    }
    if (!formData.comuna) {
      newErrors.comuna = "Selecciona una comuna";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  const isEmailValid = await validateEmail(formData.email);
  if (!isEmailValid) {
    Swal.fire('Error', 'Por favor corrige el email', 'error');
    return;
  }

  const invalidChars = /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/.test(formData.nombre);
  if (invalidChars) {
    Swal.fire('Error', 'El nombre contiene caracteres no permitidos', 'error');
    return;
  }
  // Validar campos vacíos o solo espacios
  const trimmedData = {
    ...formData,
    nombre: formData.nombre.trim(),
    direccion: formData.direccion.trim(),
    email: formData.email.trim()
  };

  if (!trimmedData.nombre || !trimmedData.direccion || !trimmedData.email) {
    Swal.fire('Error', 'No se permiten campos vacíos o solo espacios', 'error');
    return;
  }

  if (!validateForm()) {
    Swal.fire('Error', 'Por favor corrige los errores en el formulario', 'error');
    return;
  }

  try {
    const dataToSend = {
      ...trimmedData,
      telefono: trimmedData.telefono || null
    };

    if (isEditing) {
      await updateEmpresa(currentEmpresa.id, dataToSend);
      Swal.fire('Actualizado!', 'Empresa actualizada correctamente.', 'success');
    } else {
      await addEmpresa(dataToSend);
      Swal.fire('Agregado!', 'Empresa registrada correctamente.', 'success');
    }
    
    setShowModal(false);
    fetchEmpresas();
  } catch (error) {
    Swal.fire('Error', error.message || 'No se pudo guardar la empresa', 'error');
    console.error('Error:', error);
  }
};


const handleDelete = async (id, nombre) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: `Vas a eliminar la empresa: ${nombre}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      await deleteEmpresa(id); 
      Swal.fire('Eliminado!', 'La empresa ha sido eliminada.', 'success');
      fetchEmpresas(); // Recargar la lista
    } catch (error) {
      Swal.fire('Error', 'No se pudo eliminar la empresa', 'error');
      console.error('Error al eliminar:', error);
    }
  }
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
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{isEditing ? 'Editar Empresa' : 'Agregar Empresa'}</h5>
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
                            minLength={validations.nombre.minLength}
                            maxLength={validations.nombre.maxLength}
                            required 
                          />
                          {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                        </div>

                        <div className="mb-3">
                          <label className="form-label">RUT*</label>
                          <input 
                            type="text" 
                            className={`form-control ${errors.rut ? 'is-invalid' : ''}`} 
                            name="rut" 
                            value={formData.rut} 
                            onChange={handleRutChange}
                            placeholder="12345678-5"
                            required 
                          />
                          {errors.rut && <div className="invalid-feedback">{errors.rut}</div>}
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Email*</label>
                          <input 
                            type="email" 
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`} 
                            name="email" 
                            value={formData.email} 
                            onChange={handleInputChange}
                            required 
                          />
                          {emailError && (
                            <div className="invalid-feedback d-block">
                              {emailError}
                            </div>
                          )}
                          {formData.email && !emailError && (
                            <div className="valid-feedback d-block">
                              Email disponible
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Dirección*</label>
                          <input 
                            type="text" 
                            className={`form-control ${errors.direccion ? 'is-invalid' : ''}`} 
                            name="direccion" 
                            value={formData.direccion} 
                            onChange={handleInputChange}
                            minLength={validations.direccion.minLength}
                            maxLength={validations.direccion.maxLength}
                            required 
                          />
                          {errors.direccion && <div className="invalid-feedback">{errors.direccion}</div>}
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Región*</label>
                          <select
                            className={`form-select ${errors.region ? 'is-invalid' : ''}`}
                            name="region"
                            value={formData.region}
                            onChange={handleRegionChange}
                            required
                          >
                            <option value="">Selecciona una región</option>
                            {Object.keys(regionesComunas).map((reg) => (
                              <option key={reg} value={reg}>{reg}</option>
                            ))}
                          </select>
                          {errors.region && <div className="invalid-feedback">{errors.region}</div>}
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Comuna*</label>
                          <select
                            className={`form-select ${errors.comuna ? 'is-invalid' : ''}`}
                            name="comuna"
                            value={formData.comuna}
                            onChange={handleInputChange}
                            disabled={!formData.region}
                            required
                          >
                            <option value="">{formData.region ? "Selecciona una comuna" : "Primero elige una región"}</option>
                            {formData.region && regionesComunas[formData.region].map((com) => (
                              <option key={com} value={com}>{com}</option>
                            ))}
                          </select>
                          {errors.comuna && <div className="invalid-feedback">{errors.comuna}</div>}
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Teléfono</label>
                          <input 
                            type="text" 
                            className={`form-control ${errors.telefono ? 'is-invalid' : ''}`} 
                            name="telefono" 
                            value={formData.telefono} 
                            onChange={handleTelefonoChange}
                            placeholder="8-12 dígitos"
                          />
                          {errors.telefono && <div className="invalid-feedback">{errors.telefono}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary">
                      {isEditing ? 'Actualizar' : 'Guardar'}
                    </button>
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
                <th>Región</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empresas.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">No hay empresas registradas</td>
                </tr>
              ) : (
                empresas.map(empresa => (
                  <tr key={empresa.id}>
                    <td>{empresa.nombre}</td>
                    <td>{empresa.rut}</td>
                    <td>{empresa.email}</td>
                    <td>{empresa.region || 'N/A'}</td>
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