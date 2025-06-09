import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../services/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import Swal from 'sweetalert2';

export default function RegisterEmpresa() {
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre) newErrors.nombre = 'Nombre requerido';
    if (!formData.direccion) newErrors.direccion = 'Dirección requerida';
    if (!formData.telefono) newErrors.telefono = 'Teléfono requerido';
    if (!formData.email) newErrors.email = 'Email requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.password) newErrors.password = 'Contraseña requerida';
    else if (formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      await sendEmailVerification(userCredential.user);

      await setDoc(doc(db, "empresas", userCredential.user.uid), {
        nombre: formData.nombre,
        direccion: formData.direccion,
        telefono: formData.telefono,
        email: formData.email,
        tipo: 'empresa',
        createdAt: new Date()
      });

      Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text: 'Tu cuenta de empresa ha sido creada. Verifica tu correo antes de iniciar sesión.',
        timer: 3000
      });

      navigate('/login');
    } catch (error) {
      let errorMessage = 'Error al registrar la empresa';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'El correo ya está registrado';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'El correo electrónico no es válido';
      }

      Swal.fire({
        icon: 'error',
        title: 'Error en el registro',
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Registro de Empresa</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Nombre de la Empresa*</label>
                  <input
                    type="text"
                    className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                  />
                  {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                </div>

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

                <div className="mb-3">
                  <label className="form-label">Teléfono*</label>
                  <input
                    type="tel"
                    className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                  />
                  {errors.telefono && <div className="invalid-feedback">{errors.telefono}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label">Correo Electrónico*</label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label">Contraseña*</label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  <small className="text-muted">Mínimo 6 caracteres</small>
                </div>

                <div className="mb-3">
                  <label className="form-label">Confirmar Contraseña*</label>
                  <input
                    type="password"
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                </div>

                <div className="d-grid mb-3">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Registrando...' : 'Registrar Empresa'}
                  </button>
                </div>

                <div className="text-center">
                  <p>¿Ya tienes una cuenta? <Link to="/login" className="text-decoration-none">Inicia sesión</Link></p>
                  <p>¿Eres un cliente? <Link to="/registro" className="text-decoration-none">Regístrate como cliente</Link></p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}