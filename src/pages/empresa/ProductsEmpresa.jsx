import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import ProductoCard from '../../components/ProductoCard';
import ProductoModal from '../../components/ProductoModal';
import { getProductosByEmpresa, deleteProducto, createProducto, updateProducto } from '../../services/productoService';
import PerfilEmpresa from './PerfilEmpresa';

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
  const [sortConfig, setSortConfig] = useState({
    key: 'nombre',
    direction: 'asc'
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Validaciones
  const validations = {
    nombre: {
      minLength: 3,
      maxLength: 50,
      message: "Nombre debe tener entre 3 y 50 caracteres"
    },
    descripcion: {
      minLength: 10,
      maxLength: 500,
      message: "Descripción debe tener entre 10 y 500 caracteres"
    },
    cantidad: {
      min: 0,
      max: 9999,
      message: "Cantidad debe ser entre 0 y 9999"
    },
    precio: {
      min: 0,
      max: 9999999,
      message: "Precio debe ser entre $0 y $9,999,999"
    }
  };

  useEffect(() => {
    if (!userData) {
      navigate('/login');
      return;
    }
    
    const fetchProductos = async () => {
      try {
        setLoading(true);
        setError(null);
        const productosData = await getProductosByEmpresa(userData.uid);
        
        if (!productosData || !Array.isArray(productosData)) {
          throw new Error("Formato de datos inválido");
        }

        const productosValidados = productosData.map(producto => ({
          id: producto.id || '',
          nombre: producto.nombre || '',
          descripcion: producto.descripcion || '',
          vencimiento: producto.vencimiento || '',
          cantidad: producto.cantidad || 0,
          precio: producto.precio || 0,
          estado: determinarEstado(producto.vencimiento, producto.precio, producto.cantidad),
          empresaId: producto.empresaId || userData.uid
        }));

        setProductos(productosValidados);
      } catch (err) {
        console.error("Error fetching productos:", err);
        setError("Error al cargar productos");
        Swal.fire("Error", "No se pudieron cargar los productos", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, [userData, navigate]);

  const determinarEstado = (vencimiento, precio, cantidad) => {
    if (cantidad <= 0) return "agotado";
    if (precio === 0) return "gratuito";
    if (!vencimiento) return "disponible";
    
    try {
      const hoy = new Date();
      const fechaVencimiento = new Date(vencimiento);
      const diffTime = fechaVencimiento - hoy;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) return "vencido";
      if (diffDays <= 3) return "porVencer";
      return "disponible";
    } catch (e) {
      console.error("Error al calcular estado:", e);
      return "disponible";
    }
  };

  // Función de ordenamiento
  const sortedProductos = [...productos].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredProductos = sortedProductos.filter(producto => {
    if (filter === 'todos') return true;
    if (filter === 'gratuitos') return producto.precio === 0;
    if (filter === 'porVencer') {
      return producto.estado === 'porVencer' || producto.estado === 'vencido';
    }
    return producto.estado === filter;
  });

  // Paginación
  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);
  const paginatedProductos = filteredProductos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const validateProducto = (productoData) => {
    const errors = {};
    
    // Validar nombre
    const nombreTrimmed = productoData.nombre.trim();
    if (!nombreTrimmed) {
      errors.nombre = "Nombre es requerido";
    } else if (nombreTrimmed.length < validations.nombre.minLength || 
               nombreTrimmed.length > validations.nombre.maxLength) {
      errors.nombre = validations.nombre.message;
    }

    // Validar descripción
    const descripcionTrimmed = productoData.descripcion.trim();
    if (!descripcionTrimmed) {
      errors.descripcion = "Descripción es requerida";
    } else if (descripcionTrimmed.length < validations.descripcion.minLength || 
               descripcionTrimmed.length > validations.descripcion.maxLength) {
      errors.descripcion = validations.descripcion.message;
    }

    // Validar cantidad
    if (isNaN(productoData.cantidad) || 
        productoData.cantidad < validations.cantidad.min || 
        productoData.cantidad > validations.cantidad.max) {
      errors.cantidad = validations.cantidad.message;
    }

    // Validar precio
    if (isNaN(productoData.precio) || 
        productoData.precio < validations.precio.min || 
        productoData.precio > validations.precio.max) {
      errors.precio = validations.precio.message;
    }

    // Validar fecha de vencimiento
    if (productoData.vencimiento) {
      const hoy = new Date();
      const vencimiento = new Date(productoData.vencimiento);
      if (vencimiento < hoy) {
        errors.vencimiento = "La fecha no puede ser anterior a hoy";
      }
    }

    return errors;
  };

  const handleCreateOrUpdate = async (productoData, isUpdate) => {
    const validationErrors = validateProducto(productoData);
    
    if (Object.keys(validationErrors).length > 0) {
      Swal.fire({
        title: 'Errores en el formulario',
        html: Object.entries(validationErrors)
          .map(([field, error]) => `<b>${field}:</b> ${error}`)
          .join('<br>'),
        icon: 'error'
      });
      return;
    }

    try {
      const estado = determinarEstado(
        productoData.vencimiento, 
        productoData.precio,
        productoData.cantidad
      );
      
      const productoCompleto = {
        nombre: productoData.nombre.trim(),
        descripcion: productoData.descripcion.trim(),
        vencimiento: productoData.vencimiento,
        cantidad: Number(productoData.cantidad),
        precio: Number(productoData.precio),
        estado,
        empresaId: userData.uid,
        [isUpdate ? 'updatedAt' : 'createdAt']: new Date().toISOString()
      };

      let result;
      if (isUpdate) {
        await updateProducto(currentProducto.id, productoCompleto);
        setProductos(prev => prev.map(p => 
          p.id === currentProducto.id ? { ...p, ...productoCompleto } : p
        ));
        result = "actualizado";
      } else {
        const newProduct = await createProducto(productoCompleto);
        setProductos(prev => [...prev, newProduct]);
        result = "creado";
      }

      // Mostrar advertencia si el producto vence pronto
      if (productoData.vencimiento) {
        try {
          const vencimiento = new Date(productoData.vencimiento);
          const hoy = new Date();
          const diffDays = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 3 && diffDays > 0) {
            Swal.fire({
              title: '¡Producto por vencer!',
              text: `Este producto vence en ${diffDays} día(s)`,
              icon: 'warning',
              confirmButtonText: 'Entendido'
            });
          }
        } catch (e) {
          console.error("Error al calcular días de vencimiento:", e);
        }
      }

      Swal.fire("Éxito", `Producto ${result} correctamente`, "success");
      setShowModal(false);
    } catch (error) {
      console.error("Error en handleCreateOrUpdate:", error);
      Swal.fire("Error", error.message || `No se pudo ${isUpdate ? 'actualizar' : 'crear'} el producto`, "error");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar producto?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      try {
        await deleteProducto(id);
        setProductos(prev => prev.filter(p => p.id !== id));
        Swal.fire("Eliminado", "El producto ha sido eliminado", "success");
      } catch (error) {
        console.error("Error al eliminar producto:", error);
        Swal.fire("Error", "No se pudo eliminar el producto", "error");
      }
    }
  };

  if (loading) return <div className="text-center mt-5">Cargando productos...</div>;
  
  if (error) return (
    <div className="alert alert-danger mt-5">
      Error: {error}
      <button className="btn btn-link" onClick={() => window.location.reload()}>
        Reintentar
      </button>
    </div>
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button 
            className="btn btn-outline-primary me-2"
            onClick={() => setShowProfile(!showProfile)}
          >
            {showProfile ? 'Ver Productos' : 'Ver Perfil'}
          </button>
          {!showProfile && (
            <div className="d-flex">
              <select 
                className="form-select me-2"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{width: '200px'}}
              >
                <option value="todos">Todos los productos</option>
                <option value="disponible">Disponibles</option>
                <option value="gratuitos">Gratuitos</option>
                <option value="porVencer">Por vencer/Vencidos</option>
                <option value="agotado">Agotados</option>
              </select>
              
              <select 
                className="form-select me-2"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{width: '100px'}}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          )}
        </div>
        
        {!showProfile && (
          <button 
            className="btn btn-primary"
            onClick={() => {
              setCurrentProducto(null);
              setShowModal(true);
            }}
          >
            Agregar Producto
          </button>
        )}
      </div>

      {showProfile ? (
        <PerfilEmpresa empresaId={userData.uid} />
      ) : (
        <>
          <div className="table-responsive mb-3">
            <table className="table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('nombre')} style={{cursor: 'pointer'}}>
                    Nombre {sortConfig.key === 'nombre' && (
                      <i className={`fas fa-arrow-${sortConfig.direction === 'asc' ? 'up' : 'down'}`} />
                    )}
                  </th>
                  <th>Descripción</th>
                  <th onClick={() => handleSort('precio')} style={{cursor: 'pointer'}}>
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
                {paginatedProductos.length > 0 ? (
                  paginatedProductos.map(producto => (
                    <tr 
                      key={producto.id} 
                      className={producto.estado === 'vencido' ? 'table-danger' : 
                                producto.estado === 'porVencer' ? 'table-warning' : ''}
                    >
                      <td>{producto.nombre}</td>
                      <td>{producto.descripcion}</td>
                      <td>${producto.precio.toLocaleString()}</td>
                      <td>{producto.cantidad}</td>
                      <td>{producto.vencimiento || 'N/A'}</td>
                      <td>
                        <span className={`badge ${
                          producto.estado === 'disponible' ? 'bg-success' :
                          producto.estado === 'gratuito' ? 'bg-info' :
                          producto.estado === 'porVencer' ? 'bg-warning' :
                          producto.estado === 'vencido' ? 'bg-danger' : 'bg-secondary'
                        }`}>
                          {producto.estado === 'porVencer' ? 'Por vencer' : 
                           producto.estado === 'vencido' ? 'Vencido' : 
                           producto.estado}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => {
                            setCurrentProducto(producto);
                            setShowModal(true);
                          }}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(producto.id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">
                      <div className="alert alert-info">No hay productos que coincidan con el filtro</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <nav>
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    Anterior
                  </button>
                </li>
                
                {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
                  <li 
                    key={page} 
                    className={`page-item ${currentPage === page ? 'active' : ''}`}
                  >
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </li>
                ))}
                
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  >
                    Siguiente
                  </button>
                </li>
              </ul>
            </nav>
          )}

          <ProductoModal 
            show={showModal}
            onHide={() => setShowModal(false)}
            producto={currentProducto}
            onSubmit={(data) => handleCreateOrUpdate(data, !!currentProducto)}
            validations={validations}
          />
        </>
      )}
    </div>
  );
};

export default ProductsEmpresa;