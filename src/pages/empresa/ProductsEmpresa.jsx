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

        // Asegurar que los productos tengan los campos necesarios
        const productosValidados = productosData.map(producto => ({
          id: producto.id || '',
          nombre: producto.nombre || '',
          descripcion: producto.descripcion || '',
          vencimiento: producto.vencimiento || '',
          cantidad: producto.cantidad || 0,
          precio: producto.precio || 0,
          estado: producto.estado || 'disponible',
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
    if (!vencimiento) return "disponible";
    if (cantidad <= 0) return "agotado";
    if (precio === 0) return "gratuito";
    
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

  const filteredProductos = productos.filter(producto => {
    if (filter === 'todos') return true;
    if (filter === 'gratuitos') return producto.precio === 0;
    if (filter === 'porVencer') {
      const estado = determinarEstado(producto.vencimiento, producto.precio, producto.cantidad);
      return estado === 'porVencer' || estado === 'vencido';
    }
    return producto.estado === filter;
  });

  const handleCreateOrUpdate = async (productoData, isUpdate) => {
    try {
      // Validación básica
      if (!productoData.nombre || !productoData.descripcion) {
        throw new Error("Nombre y descripción son requeridos");
      }

      const estado = determinarEstado(
        productoData.vencimiento, 
        productoData.precio,
        productoData.cantidad
      );
      
      const productoCompleto = {
        ...productoData,
        empresaId: userData.uid,
        estado,
        cantidad: Number(productoData.cantidad),
        precio: Number(productoData.precio),
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

      // Mostrar advertencia si el producto vence en 3 días o menos
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
            <select 
              className="form-select"
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
          <div className="row">
            {filteredProductos.length > 0 ? (
              filteredProductos.map(producto => (
                <div className="col-md-4 mb-4" key={producto.id}>
                  <ProductoCard 
                    producto={producto}
                    onEdit={() => {
                      setCurrentProducto(producto);
                      setShowModal(true);
                    }}
                    onDelete={() => handleDelete(producto.id)}
                  />
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="alert alert-info">No hay productos que coincidan con el filtro</div>
              </div>
            )}
          </div>

          <ProductoModal 
            show={showModal}
            onHide={() => setShowModal(false)}
            producto={currentProducto}
            onSubmit={(data) => handleCreateOrUpdate(data, !!currentProducto)}
          />
        </>
      )}
    </div>
  );
};

export default ProductsEmpresa;