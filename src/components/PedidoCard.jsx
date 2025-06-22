// src/components/PedidoCard.jsx
import React from 'react';
import { Card, Badge } from 'react-bootstrap';

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
  const estado = getEstadoBadge(pedido.estado);

  return (
    <Card className="shadow-sm h-100">
      <Card.Body>
        <div className="d-flex justify-content-between">
          <Card.Title>{pedido.productoNombre || 'Producto'}</Card.Title>
          <Badge bg={estado.variant}>{estado.text}</Badge>
        </div>
        <Card.Text>
          <strong>Empresa:</strong> {pedido.empresaNombre || 'N/A'}
        </Card.Text>
        <Card.Text>
          <strong>Cantidad:</strong> {pedido.cantidadSolicitada}
        </Card.Text>
        <Card.Text>
          <strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleDateString()}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default PedidoCard;