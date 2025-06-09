import { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../services/firebase";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";
import { saveUserData } from "../services/userService";
import { regionesComunas } from "../data/regionesComunas";

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nombre: "",
    direccion: "",
    region: "",
    comuna: "",
    telefono: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    return password.length >= 6 && password.length <= 20 && hasNumber && hasLetter;
  };

  const handleTelefonoChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setFormData(prev => ({ ...prev, telefono: value }));
  };

  const handleRegionChange = (e) => {
    setFormData(prev => ({ 
      ...prev, 
      region: e.target.value,
      comuna: "" 
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validatePassword(formData.password)) {
      Swal.fire("Error", "La contraseña debe tener 6-20 caracteres, con al menos 1 número y 1 letra.", "error");
      setLoading(false);
      return;
    }

    if (formData.telefono && (formData.telefono.length < 8 || formData.telefono.length > 12)) {
      Swal.fire("Error", "El teléfono debe tener entre 8 y 12 dígitos.", "error");
      setLoading(false);
      return;
    }

    if (!formData.region || !formData.comuna) {
      Swal.fire("Error", "Debes seleccionar una región y comuna.", "error");
      setLoading(false);
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await sendEmailVerification(cred.user);

      await saveUserData(cred.user.uid, {
        nombre: formData.nombre,
        email: formData.email,
        direccion: formData.direccion,
        region: formData.region,
        comuna: formData.comuna,
        telefono: formData.telefono || null,
        tipo: "cliente",
      });

      Swal.fire("Registrado", "Usuario creado. Verifica tu correo antes de iniciar sesión.", "success");
      navigate("/login");
    } catch (error) {
      let errorMessage = "No se pudo registrar. ¿El correo ya está en uso?";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "El correo electrónico ya está registrado";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "El correo electrónico no es válido";
      }
      Swal.fire("Error", errorMessage, "error");
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
              <h3 className="mb-0">Registro de Cliente</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleRegister}>
                <div className="mb-3">
                  <label className="form-label">Nombre completo*</label>
                  <input
                    type="text"
                    className="form-control"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    minLength="3"
                    maxLength="50"
                    required
                    placeholder="Ej: Juan Pérez"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Correo electrónico*</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    minLength="5"
                    maxLength="50"
                    required
                    placeholder="ejemplo@correo.com"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Contraseña*</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    minLength="6"
                    maxLength="20"
                    required
                    placeholder="Mínimo 6 caracteres con números y letras"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Dirección*</label>
                  <input
                    type="text"
                    className="form-control"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    minLength="5"
                    maxLength="100"
                    required
                    placeholder="Ej: Av. Principal 123"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Región*</label>
                  <select
                    className="form-select"
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
                </div>

                <div className="mb-3">
                  <label className="form-label">Comuna*</label>
                  <select
                    className="form-select"
                    name="comuna"
                    value={formData.comuna}
                    onChange={handleChange}
                    disabled={!formData.region}
                    required
                  >
                    <option value="">{formData.region ? "Selecciona una comuna" : "Primero elige una región"}</option>
                    {formData.region && regionesComunas[formData.region].map((com) => (
                      <option key={com} value={com}>{com}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Teléfono (opcional)</label>
                  <input
                    type="text"
                    className="form-control"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleTelefonoChange}
                    minLength="8"
                    maxLength="12"
                    placeholder="Ej: 912345678"
                  />
                  <small className="text-muted">Solo números, 8-12 dígitos.</small>
                </div>

                <div className="d-grid mb-3">
                  <button 
                    type="submit" 
                    className="btn btn-success"
                    disabled={loading}
                  >
                    {loading ? 'Registrando...' : 'Registrarse'}
                  </button>
                </div>

                <div className="text-center">
                  <p>¿Ya tienes una cuenta? <Link to="/login" className="text-decoration-none">Inicia sesión</Link></p>
                  <p>¿Eres una empresa? <Link to="/registro-empresa" className="text-decoration-none">Registra tu empresa</Link></p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}