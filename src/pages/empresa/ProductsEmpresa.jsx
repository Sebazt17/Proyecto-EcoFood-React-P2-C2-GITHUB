import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import ProductoModal from '../../components/ProductoModal';
import PerfilEmpresa from './PerfilEmpresa';
import { getProductosByEmpresa, deleteProducto, createProducto, updateProducto } from '../../services/productoService';

// Validaciones definidas como constante
const productValidations = {
  nombre: {
    required: "El nombre es requerido",
    minLength: {
      value: 3,
      message: "Mínimo 3 caracteres"
    },
    maxLength: {
      value: 50,
      message: "Máximo 50 caracteres"
    },
    pattern: {
      value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/,
      message: "No se permiten caracteres especiales"
    }
  },
  descripcion: {
    required: "La descripción es requerida",
    minLength: {
      value: 10,
      message: "Mínimo 10 caracteres"
    },
    maxLength: {
      value: 500,
      message: "Máximo 500 caracteres"
    }
  },
  precio: {
    required: "El precio es requerido",
    min: {
      value: 0,
      message: "El precio no puede ser negativo"
    },
    max: {
      value: 1000000,
      message: "El precio máximo es $1,000,000"
    },
    pattern: {
      value: /^\d+(\.\d{1,2})?$/,
      message: "Solo números con máximo 2 decimales"
    }
  },
  cantidad: {
    required: "La cantidad es requerida",
    min: {
      value: 0,
      message: "La cantidad no puede ser negativa"
    },
    max: {
      value: 10000,
      message: "La cantidad máxima es 10,000"
    },
    pattern: {
      value: /^[0-9]+$/,
      message: "Solo números enteros"
    }
  },
  vencimiento: {
    validate: (value) => {
      if (!value) return true;
      const today = new Date();
      const expiryDate = new Date(value);
      return expiryDate >= today || "La fecha debe ser hoy o en el futuro";
    }
  },
  estado: {
    required: "El estado es requerido"
  }
};

const ProductsEmpresa = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentProducto, setCurrentProducto] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [filter, setFilter] = useState('todos');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'nombre', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!userData) {
      navigate('/login');
      return;
    }
    loadProductos();
  }, [userData, navigate]);

  const loadProductos = async () => {
    try {
      setLoading(true);
      const productosData = await getProductosByEmpresa(userData.uid);
      setProductos(productosData);
    } catch (err) {
      console.error("Error fetching productos:", err);
      setError("Error al cargar productos");
      Swal.fire("Error", "No se pudieron cargar los productos", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar!'
      });

      if (result.isConfirmed) {
        await deleteProducto(id);
        await loadProductos();
        Swal.fire('Eliminado!', 'El producto ha sido eliminado.', 'success');
      }
    } catch (error) {
      Swal.fire('Error', 'No se pudo eliminar el producto', 'error');
    }
  };

  const handleSubmit = async (productoData) => {
    try {
      if (currentProducto) {
        await updateProducto(currentProducto.id, productoData);
        Swal.fire('Actualizado!', 'El producto ha sido actualizado.', 'success');
      } else {
        await createProducto({ ...productoData, empresaId: userData.uid });
        Swal.fire('Creado!', 'El producto ha sido creado.', 'success');
      }
      setShowModal(false);
      await loadProductos();
    } catch (error) {
      console.error("Error al guardar producto:", error);
      Swal.fire("Error", "No se pudo guardar el producto", "error");
    }
  };

  const sortedProductos = [...productos].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredProductos = sortedProductos.filter(producto => {
    if (filter === 'todos') return true;
    if (filter === 'disponible') return producto.estado === 'disponible';
    if (filter === 'gratuitos') return producto.precio === 0;
    if (filter === 'porVencer') return producto.estado === 'porVencer';
    if (filter === 'vencido') return producto.estado === 'vencido';
    if (filter === 'agotado') return producto.estado === 'agotado';
    return true;
  });

  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);
  const paginatedProductos = filteredProductos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <div className="text-center mt-5">Cargando productos...</div>;
  if (error) return <div className="alert alert-danger mt-5">Error: {error}</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button className="btn btn-outline-primary me-2" onClick={() => setShowProfile(!showProfile)}>
            {showProfile ? 'Ver Productos' : 'Ver Perfil'}
          </button>
          {!showProfile && (
            <>
              <Link to="/empresa/solicitudes" className="btn btn-outline-success me-2">
                Ver Solicitudes
              </Link>
              <select 
                className="form-select d-inline-block me-2"
                style={{ width: '200px' }}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="disponible">Disponibles</option>
                <option value="porVencer">Por vencer</option>
                <option value="vencido">Vencidos</option>
                <option value="agotado">Agotados</option>
                <option value="gratuitos">Gratuitos</option>
              </select>
              <select 
                className="form-select d-inline-block"
                style={{ width: '100px' }}
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </>
          )}
        </div>
        {!showProfile && (
          <button className="btn btn-primary" onClick={() => {
            setCurrentProducto(null);
            setShowModal(true);
          }}>
            Agregar Producto
          </button>
        )}
      </div>

      {showProfile ? (
        <PerfilEmpresa empresaId={userData.uid} />
      ) : (
        <>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('nombre')} style={{ cursor: 'pointer' }}>
                    Nombre {sortConfig.key === 'nombre' && (
                      <i className={`fas fa-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'}`} />
                    )}
                  </th>
                  <th>Descripción</th>
                  <th onClick={() => handleSort('precio')} style={{ cursor: 'pointer' }}>
                    Precio {sortConfig.key === 'precio' && (
                      <i className={`fas fa-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'}`} />
                    )}
                  </th>
                  <th>Cantidad</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProductos.map(p => (
                  <tr key={p.id}>
                    <td>{p.nombre}</td>
                    <td>{p.descripcion}</td>
                    <td>${p.precio}</td>
                    <td>{p.cantidad}</td>
                    <td>{p.vencimiento || 'N/A'}</td>
                    <td>{p.estado}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => {
                          setCurrentProducto(p);
                          setShowModal(true);
                        }}
                      >
                        Editar
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(p.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <nav>
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                    Anterior
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => (
                  <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                    Siguiente
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}

      <ProductoModal 
        show={showModal}
        onHide={() => setShowModal(false)}
        producto={currentProducto}
        onSubmit={handleSubmit}
        validations={productValidations}
      />
    </div>
  );
};

export default ProductsEmpresa;