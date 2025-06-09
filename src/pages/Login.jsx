import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validación básica antes de enviar
    if (!email || !password) {
      Swal.fire({
        title: "Campos incompletos",
        text: "Por favor ingresa tu correo y contraseña",
        icon: "warning",
        confirmButtonText: "Entendido"
      });
      return;
    }

    setLoading(true);

    try {
      const userType = await login(email, password);
      
      Swal.fire({
        title: "¡Bienvenido!",
        text: "Redirigiendo a tu panel...",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });

      // Redirección inteligente
      const redirectPath = {
        admin: "/admin/dashboard",
        empresa: "/empresa/productos",
        cliente: "/cliente/dashboard"
      }[userType] || "/home";

      navigate(redirectPath);
      
    } catch (error) {
      let errorMessage = "Ocurrió un error al iniciar sesión";
      
      // Manejo detallado de errores
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
          errorMessage = "Correo o contraseña incorrectos. Por favor, verifica tus datos";
          break;
        case 'auth/user-not-found':
          errorMessage = "Cuenta no encontrada. ¿Necesitas registrarte?";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Demasiados intentos. Por seguridad, inténtalo más tarde";
          break;
        case 'auth/user-disabled':
          errorMessage = "Cuenta deshabilitada. Contacta al administrador";
          break;
        default:
          errorMessage = "Error al iniciar sesión. Intenta nuevamente";
      }

      Swal.fire({
        title: "Error de acceso",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "Entendido"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Iniciar Sesión</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label">Correo Electrónico</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="ejemplo@correo.com"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div className="d-grid mb-3">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Iniciando...
                      </>
                    ) : 'Iniciar Sesión'}
                  </button>
                </div>
                <div className="text-center">
                  <Link to="/recuperar-contrasena" className="text-decoration-none">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </form>
              
              {/* Sección de enlaces de registro */}
              <div className="mt-4 pt-3 border-top">
                <p className="text-center mb-2">¿No tienes una cuenta?</p>
                <div className="d-flex flex-column gap-2">
                  <Link to="/registro" className="btn btn-outline-primary">
                    Regístrate como Cliente
                  </Link>
                  <Link to="/registro-empresa" className="btn btn-outline-success">
                    Registra tu Empresa
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}