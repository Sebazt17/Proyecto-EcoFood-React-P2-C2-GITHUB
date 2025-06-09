import { NavLink } from 'react-router-dom';
import { useAuth } from "../../../context/AuthContext";
import CerrarSesion from "../../CerrarSesion";

export default function NavAdmin() {
    const { userData } = useAuth();

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container-fluid">
                <NavLink className="navbar-brand" to="/admin/dashboard">
                    EcoFood Admin {userData?.nombre && `(${userData.nombre})`}
                </NavLink>
                <button className="navbar-toggler" type="button" 
                        data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/admin/dashboard">Dashboard</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/admin/empresas">Empresas</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/admin/clientes">Clientes</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/admin/administradores">Administradores</NavLink>
                        </li>
                    </ul>
                    <CerrarSesion />
                </div>
            </div>
        </nav>
    );
}