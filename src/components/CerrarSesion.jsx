import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Button } from "react-bootstrap";

export default function CerrarSesion({ variant = "danger", className = "", size }) {
    const navigate = useNavigate();
    
    const handleLogout = async () => {
        try {
            await signOut(auth);
            Swal.fire({
                title: "Sesión cerrada",
                text: "Has cerrado sesión correctamente",
                icon: "success",
                timer: 2000
            });
            navigate("/login");
        } catch (error) {
            Swal.fire("Error", "No se pudo cerrar la sesión", "error");
        }
    };
    
    return (
        <Button 
            onClick={handleLogout} 
            variant={variant}
            className={`${className} d-flex align-items-center`}
            size={size}
        >
            <i className="bi bi-box-arrow-right me-2"></i>
            Cerrar Sesión
        </Button>
    );
}