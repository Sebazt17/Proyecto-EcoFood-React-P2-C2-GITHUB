import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUsers, updateUserRole } from '../../services/userService';
import Swal from 'sweetalert2';

export default function AdminUsuarios() {
  const { userData } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersList = await getUsers();
        setUsers(usersList);
        setLoading(false);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
        Swal.fire("Error", "No se pudieron cargar los usuarios", "error");
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(user => 
        user.id === userId ? {...user, tipo: newRole} : user
      ));
      Swal.fire("Éxito", "Rol actualizado correctamente", "success");
    } catch (error) {
      console.error("Error actualizando rol:", error);
      Swal.fire("Error", "No se pudo actualizar el rol", "error");
    }
  };

  if (loading) return <div className="text-center mt-5">Cargando usuarios...</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Gestión de Usuarios</h2>
      <div className="card shadow">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol Actual</th>
                  <th>Cambiar Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.nombre || 'Sin nombre'}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.tipo === 'admin' ? 'bg-success' : 'bg-primary'}`}>
                        {user.tipo}
                      </span>
                    </td>
                    <td>
                    <select 
                        className="form-select form-select-sm"
                        value={user.tipo}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={user.id === userData?.uid}
                    >
                        <option value="admin">Administrador</option>
                        <option value="cliente">Cliente</option>
                      </select>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        disabled={user.id === userData?.uid} // No permitir desactivar propio usuario
                      >
                        Desactivar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}