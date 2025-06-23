import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import ProductoCard from '../../components/ProductoCard';
import { useAuth } from '../../context/AuthContext';
import { crearPedido } from '../../services/pedidoService';
import Swal from 'sweetalert2';
import React, { useState, useEffect } from 'react';

export default function VerProductos() {
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const { userData } = useAuth();

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const conditions = [where('cantidad', '>', 0)]; // Productos con stock

        if (filtro === 'gratuitos') {
          conditions.push(where('precio', '==', 0));
        }

        const q = query(collection(db, 'productos'), ...conditions);
        const snapshot = await getDocs(q);
        setProductos(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      } catch (error) {
        console.error('Error al cargar productos:', error);
      }
    };
    fetchProductos();
  }, [filtro]);

  const handleSolicitar = async (producto, cantidad) => {
    if (cantidad > producto.cantidad) {
      Swal.fire('Error', 'La cantidad solicitada supera el stock disponible.', 'error');
      return;
    }

    try {
      await crearPedido({
        clienteId: userData.uid,
        productoId: producto.id,
        empresaId: producto.empresaId || '',
        cantidadSolicitada: cantidad
      });
      Swal.fire('¡Solicitud realizada!', 'Tu pedido ha sido registrado.', 'success');
    } catch (error) {
      console.error('Error al crear pedido:', error);
      Swal.fire('Error', 'No se pudo realizar el pedido.', 'error');
    }
  };

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <select 
          className="form-select" 
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        >
          <option value="todos">Todos los productos</option>
          <option value="gratuitos">Solo gratuitos</option>
        </select>
      </div>
      <div className="row">
        {productos.length === 0 ? (
          <div className="alert alert-info">No hay productos disponibles.</div>
        ) : (
          productos.map(producto => (
            <div key={producto.id} className="col-md-4 mb-4">
              <ProductoCard 
                producto={producto}
                onSolicitar={(cantidad) => handleSolicitar(producto, cantidad)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
