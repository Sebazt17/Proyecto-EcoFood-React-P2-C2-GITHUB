import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateUserData } from '../../services/userService';
import { regionesComunas } from '../../data/regionesComunas';
import Swal from 'sweetalert2';
import * as Yup from 'yup';

const perfilSchema = Yup.object().shape({
  nombre: Yup.string()
    .min(3, 'Mínimo 3 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo letras permitidas')
    .required('Campo requerido'),
  direccion: Yup.string()
    .min(5, 'Mínimo 5 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .required('Campo requerido'),
  region: Yup.string().required('Selecciona una región'),
  comuna: Yup.string().required('Selecciona una comuna')
});

export default function EditarPerfil() {
  const { userData } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    region: '',
    comuna: ''
  });
  const [comunas, setComunas] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData) {
      setFormData({
        nombre: userData.nombre || '',
        direccion: userData.direccion || '',
        region: userData.region || '',
        comuna: userData.comuna || ''
      });
      
      if (userData.region) {
        setComunas(regionesComunas[userData.region] || []);
      }
      
      setLoading(false);
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'region') {
      setComunas(regionesComunas[value] || []);
      setFormData(prev => ({
        ...prev,
        comuna: ''
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await perfilSchema.validate(formData, { abortEarly: false });
      
      await updateUserData(userData.uid, formData);
      
      Swal.fire({
        title: '¡Éxito!',
        text: 'Tus datos se actualizaron correctamente',
        icon: 'success',
        timer: 2000
      });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const newErrors = {};
        error.inner.forEach(err => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      } else {
        Swal.fire('Error', 'No se pudo actualizar el perfil', 'error');
        console.error('Error:', error);
      }
    }
  };

  if (loading) return <div className="container mt-4">Cargando...</div>;

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-body">
          <h2 className="card-title mb-4">Editar Perfil</h2>
          
          <form onSubmit={handleSubmit} noValidate>
            {/* Nombre */}
            <div className="mb-3">
              <label className="form-label">Nombre Completo*</label>
              <input
                type="text"
                className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
              />
              {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
            </div>
            
            {/* Dirección */}
            <div className="mb-3">
              <label className="form-label">Dirección*</label>
              <input
                type="text"
                className={`form-control ${errors.direccion ? 'is-invalid' : ''}`}
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
              />
              {errors.direccion && <div className="invalid-feedback">{errors.direccion}</div>}
            </div>
            
            {/* Región */}
            <div className="mb-3">
              <label className="form-label">Región*</label>
              <select
                className={`form-select ${errors.region ? 'is-invalid' : ''}`}
                name="region"
                value={formData.region}
                onChange={handleChange}
              >
                <option value="">Selecciona una región</option>
                {Object.keys(regionesComunas).map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              {errors.region && <div className="invalid-feedback">{errors.region}</div>}
            </div>
            
            {/* Comuna */}
            <div className="mb-3">
              <label className="form-label">Comuna*</label>
              <select
                className={`form-select ${errors.comuna ? 'is-invalid' : ''}`}
                name="comuna"
                value={formData.comuna}
                onChange={handleChange}
                disabled={!formData.region}
              >
                <option value="">{formData.region ? 'Selecciona una comuna' : 'Primero selecciona una región'}</option>
                {comunas.map(comuna => (
                  <option key={comuna} value={comuna}>{comuna}</option>
                ))}
              </select>
              {errors.comuna && <div className="invalid-feedback">{errors.comuna}</div>}
            </div>
            
            <div className="d-grid gap-2 mt-4">
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