// src/pages/cliente/VerProductos.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import ProductoCard from '../../components/ProductoCard';
import { useAuth } from '../../context/AuthContext';
import { crearPedido } from '../../services/pedidoService';

export default function VerProductos() {
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const { userData } = useAuth();

  useEffect(() => {
    const fetchProductos = async () => {
      let q = query(
        collection(db, 'productos'), 
        where('estado', '!=', 'vencido')
      );
      
      if (filtro === 'gratuitos') {
        q = query(q, where('precio', '==', 0));
      }

      const snapshot = await getDocs(q);
      setProductos(snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })));
    };
    fetchProductos();
  }, [filtro]);

  const handleSolicitar = async (productoId, cantidad) => {
    try {
      await crearPedido({
        clienteId: userData.uid,
        productoId,
        cantidadSolicitada: cantidad,
        clienteNombre: userData.nombre || 'Cliente'
      });
    } catch (error) {
      console.error('Error al crear pedido:', error);
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
        {productos.map(producto => (
          <div key={producto.id} className="col-md-4 mb-4">
            <ProductoCard 
              producto={producto}
              onSolicitar={(cantidad) => handleSolicitar(producto.id, cantidad)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}