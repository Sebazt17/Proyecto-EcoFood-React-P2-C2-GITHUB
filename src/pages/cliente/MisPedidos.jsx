// src/pages/cliente/MisPedidos.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPedidosByCliente } from '../../services/pedidoService';
import PedidoCard from '../../components/PedidoCard';

export default function MisPedidos() {
  const { userData } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedidos = async () => {
      if (userData?.uid) {
        const pedidosData = await getPedidosByCliente(userData.uid);
        setPedidos(pedidosData);
        setLoading(false);
      }
    };
    fetchPedidos();
  }, [userData]);

  if (loading) return <div className="container mt-4">Cargando pedidos...</div>;

  return (
    <div className="container mt-4">
      <h2>Mis Pedidos</h2>
      {pedidos.length === 0 ? (
        <div className="alert alert-info mt-3">
          No has realizado ningún pedido aún.
        </div>
      ) : (
        <div className="row mt-3">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="col-md-6 mb-3">
              <PedidoCard pedido={pedido} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}