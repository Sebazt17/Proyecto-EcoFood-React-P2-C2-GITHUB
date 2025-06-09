import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../services/firebase";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email) {
      Swal.fire("Campo vacío", "Por favor ingresa tu correo", "warning");
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Swal.fire(
        "Correo enviado",
        "Revisa tu bandeja de entrada para restablecer tu contraseña.",
        "success"
      );
    } catch (error) {
      Swal.fire("Error", error.message || "No se pudo enviar el correo. ¿Está registrado?", "error");
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
              <h3 className="mb-0">Recuperar Contraseña</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleReset}>
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
                <div className="d-grid mb-3">
                  <button 
                    type="submit" 
                    className="btn btn-warning"
                    disabled={loading}
                  >
                    {loading ? 'Enviando...' : 'Enviar correo'}
                  </button>
                </div>
                <div className="text-center">
                  <Link to="/login" className="text-decoration-none">
                    Volver al inicio de sesión
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}