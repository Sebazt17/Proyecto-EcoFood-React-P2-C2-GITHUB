import React from 'react';
import { Badge, Card, Button } from 'react-bootstrap';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const ProductoCard = ({ producto, onEdit, onDelete }) => {
  const getBadgeColor = () => {
    switch (producto.estado) {
      case 'disponible': return 'success';
      case 'porVencer': return 'warning';
      case 'gratuito': return 'info';
      case 'vencido': return 'danger';
      default: return 'secondary';
    }
  };

  const getEstadoText = () => {
    switch (producto.estado) {
      case 'disponible': return 'Disponible';
      case 'porVencer': return 'Por vencer';
      case 'gratuito': return 'Gratuito';
      case 'vencido': return 'Vencido';
      default: return producto.estado;
    }
  };

  const handleDeleteClick = () => {
    MySwal.fire({
      title: '¿Eliminar producto?',
      text: `¿Estás seguro de eliminar ${producto.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        onDelete();
      }
    });
  };

  return (
    <Card className="h-100">
      <Card.Body>
        <div className="d-flex justify-content-between">
          <Card.Title>{producto.nombre}</Card.Title>
          <Badge bg={getBadgeColor()}>{getEstadoText()}</Badge>
        </div>
        <Card.Text>{producto.descripcion}</Card.Text>
        <Card.Text>
          <strong>Vencimiento:</strong> {new Date(producto.vencimiento).toLocaleDateString()}
        </Card.Text>
        <Card.Text>
          <strong>Cantidad:</strong> {producto.cantidad}
        </Card.Text>
        <Card.Text>
          <strong>Precio:</strong> {producto.precio === 0 ? 'Gratuito' : `$${producto.precio}`}
        </Card.Text>
      </Card.Body>
      <Card.Footer>
        <Button variant="primary" size="sm" onClick={onEdit} className="me-2">
          Editar
        </Button>
        <Button variant="danger" size="sm" onClick={handleDeleteClick}>
          Eliminar
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default ProductoCard;