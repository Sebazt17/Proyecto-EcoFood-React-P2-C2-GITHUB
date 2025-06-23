// src/pages/empresa/SolicitudesEmpresa.jsx
import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { aprobarPedido, rechazarPedido } from '../../services/empresaService';
import { aprobarPedidoYDescontarStock, actualizarEstadoPedido } from '../../services/pedidoService';


export default function SolicitudesEmpresa() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const q = query(collection(db, 'pedidos'), where('estado', '==', 'pendiente'));
        const snapshot = await getDocs(q);
        setPedidos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error al cargar pedidos pendientes:', error);
      }
    };

    fetchPedidos();
  }, []);

  const handleAprobar = async (pedidoId) => {
    try {
      await aprobarPedido(pedidoId);
      setPedidos(prev => prev.filter(p => p.id !== pedidoId));
    } catch (error) {
      alert('Error al aprobar el pedido');
    }
  };

  const handleRechazar = async (pedidoId) => {
    try {
      await rechazarPedido(pedidoId);
      setPedidos(prev => prev.filter(p => p.id !== pedidoId));
    } catch (error) {
      alert('Error al rechazar el pedido');
    }
  };

return (
  <div className="container mt-4">
    <h2>Solicitudes Pendientes</h2>
    {pedidos.length === 0 && (
      <div className="alert alert-info">No hay solicitudes pendientes.</div>
    )}
    {pedidos.map(pedido => (
      <div key={pedido.id} className="card mb-3 shadow-sm">
        <div className="card-body">
          <h5 className="card-title">{pedido.productoNombre}</h5>
          <p className="card-text">Cantidad: {pedido.cantidadSolicitada}</p>
          <button
            className="btn btn-success me-2"
            onClick={async () => {
              try {
                await aprobarPedidoYDescontarStock(pedido.id);
                setPedidos(prev => prev.filter(p => p.id !== pedido.id));
                alert('Pedido aprobado y stock actualizado');
              } catch (error) {
                console.error('Error al aprobar pedido:', error);
                alert('Error al aprobar el pedido');
              }
            }}
          >
            Aprobar
          </button>
          <button
            className="btn btn-danger"
            onClick={async () => {
              try {
                await actualizarEstadoPedido(pedido.id, 'rechazado');
                setPedidos(prev => prev.filter(p => p.id !== pedido.id));
                alert('Pedido rechazado');
              } catch (error) {
                console.error('Error al rechazar pedido:', error);
                alert('Error al rechazar el pedido');
              }
            }}
          >
            Rechazar
          </button>
        </div>
      </div>
    ))}
  </div>
);
}
