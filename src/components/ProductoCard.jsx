import React, { useState, useEffect } from 'react';
import { Badge, Card, Button } from 'react-bootstrap';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const MySwal = withReactContent(Swal);

const ProductoCard = ({ producto, onEdit, onDelete, onSolicitar }) => {
  const [cantidad, setCantidad] = useState(1);
  const [empresaNombre, setEmpresaNombre] = useState('Cargando...');

  useEffect(() => {
    const fetchEmpresaNombre = async () => {
      if (producto.empresaId) {
        try {
          const docRef = doc(db, 'empresas', producto.empresaId);
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
  }, [producto.empresaId]);

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

  const handleSolicitar = () => {
    if (cantidad > producto.cantidad) {
      MySwal.fire('Error', 'No hay suficiente stock disponible', 'error');
      return;
    }

    MySwal.fire({
      title: 'Confirmar solicitud',
      html: `¿Solicitar <b>${cantidad}</b> unidad(es) de <b>${producto.nombre}</b>?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        onSolicitar(cantidad);
      }
    });
  };

  const vencimientoStr = producto.vencimiento?.toDate 
    ? producto.vencimiento.toDate().toLocaleDateString() 
    : 'No disponible';

  return (
    <Card className="h-100 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between">
          <Card.Title>{producto.nombre}</Card.Title>
          <Badge bg={getBadgeColor()} className="align-self-start">
            {getEstadoText()}
          </Badge>
        </div>
        <Card.Text className="text-muted">{producto.descripcion}</Card.Text>
        <Card.Text>
          <strong>Empresa:</strong> {empresaNombre}
        </Card.Text>
        <Card.Text>
          <strong>Vencimiento:</strong> {vencimientoStr}
        </Card.Text>
        <Card.Text>
          <strong>Stock:</strong> {producto.cantidad} unidades
        </Card.Text>
        <Card.Text>
          <strong>Precio:</strong> {producto.precio === 0 ? 'Gratuito' : `$${producto.precio}`}
        </Card.Text>

        {onSolicitar && (
          <div className="mt-3">
            <div className="d-flex align-items-center mb-2">
              <label htmlFor="cantidad" className="me-2">Cantidad:</label>
              <input
                id="cantidad"
                type="number"
                min="1"
                max={producto.cantidad}
                value={cantidad}
                onChange={(e) => setCantidad(Math.max(1, Math.min(producto.cantidad, parseInt(e.target.value) || 1)))}
                className="form-control form-control-sm"
                style={{ width: '70px' }}
              />
            </div>
            <Button
              variant="success"
              size="sm"
              onClick={handleSolicitar}
              disabled={producto.cantidad <= 0}
              className="w-100"
            >
              {producto.cantidad <= 0 ? 'Sin stock' : 'Solicitar'}
            </Button>
          </div>
        )}
      </Card.Body>

      {(onEdit || onDelete) && (
        <Card.Footer className="bg-transparent">
          <div className="d-flex justify-content-between">
            {onEdit && (
              <Button variant="primary" size="sm" onClick={onEdit}>
                Editar
              </Button>
            )}
            {onDelete && (
              <Button variant="danger" size="sm" onClick={() => onDelete()}>
                Eliminar
              </Button>
            )}
          </div>
        </Card.Footer>
      )}
    </Card>
  );
};

export default ProductoCard;
