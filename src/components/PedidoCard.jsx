// src/components/PedidoCard.jsx
import React, { useEffect, useState } from 'react';
import { Card, Badge } from 'react-bootstrap';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

const getEstadoBadge = (estado) => {
  switch (estado) {
    case 'pendiente':
      return { variant: 'warning', text: 'Pendiente' };
    case 'aprobado':
      return { variant: 'success', text: 'Aprobado' };
    case 'rechazado':
      return { variant: 'danger', text: 'Rechazado' };
    case 'entregado':
      return { variant: 'info', text: 'Entregado' };
    default:
      return { variant: 'secondary', text: estado };
  }
};

const PedidoCard = ({ pedido }) => {
  const [empresaNombre, setEmpresaNombre] = useState('Cargando...');
  const estado = getEstadoBadge(pedido.estado);

  useEffect(() => {
    const fetchEmpresaNombre = async () => {
      if (pedido.empresaId) {
        try {
          const docRef = doc(db, 'empresas', pedido.empresaId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setEmpresaNombre(docSnap.data().nombre || 'Sin nombre');
          } else {
            setEmpresaNombre('No encontrada');
          }
        } catch (error) {
          console.error('Error al obtener empresa:', error);
          setEmpresaNombre('Error');
        }
      } else {
        setEmpresaNombre('N/A');
      }
    };
    fetchEmpresaNombre();
  }, [pedido.empresaId]);

  const fechaStr = pedido.fecha?.toDate
    ? pedido.fecha.toDate().toLocaleDateString()
    : new Date(pedido.fecha).toLocaleDateString();

  return (
    <Card className="shadow-sm h-100">
      <Card.Body>
        <div className="d-flex justify-content-between">
          <Card.Title>{pedido.productoNombre || 'Producto'}</Card.Title>
          <Badge bg={estado.variant}>{estado.text}</Badge>
        </div>
        <Card.Text>
          <strong>Empresa:</strong> {empresaNombre}
        </Card.Text>
        <Card.Text>
          <strong>Cantidad:</strong> {pedido.cantidadSolicitada}
        </Card.Text>
        <Card.Text>
          <strong>Fecha:</strong> {fechaStr}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default PedidoCard;
