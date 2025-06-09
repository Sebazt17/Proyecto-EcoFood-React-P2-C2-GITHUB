import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import Swal from 'sweetalert2';

const ProductoModal = ({ show, onHide, producto, onSubmit }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    vencimiento: '',
    cantidad: 1,
    precio: 0
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        vencimiento: producto.vencimiento,
        cantidad: producto.cantidad,
        precio: producto.precio
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        vencimiento: '',
        cantidad: 1,
        precio: 0
      });
    }
    setErrors({});
  }, [producto, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validación en tiempo real
    if (name === 'cantidad' && parseInt(value) <= 0) {
      setErrors(prev => ({...prev, cantidad: 'La cantidad debe ser mayor a 0'}));
    } else if (name === 'precio' && parseFloat(value) < 0) {
      setErrors(prev => ({...prev, precio: 'El precio no puede ser negativo'}));
    } else if (name === 'vencimiento') {
      const hoy = new Date();
      const fechaVenc = new Date(value);
      if (fechaVenc < hoy) {
        setErrors(prev => ({...prev, vencimiento: 'La fecha no puede ser pasada'}));
      } else {
        setErrors(prev => ({...prev, vencimiento: ''}));
      }
    } else {
      setErrors(prev => ({...prev, [name]: ''}));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const hoy = new Date();
    const fechaVenc = new Date(formData.vencimiento);

    if (!formData.nombre.trim()) newErrors.nombre = 'Nombre es requerido';
    if (!formData.descripcion.trim()) newErrors.descripcion = 'Descripción es requerida';
    if (!formData.vencimiento) newErrors.vencimiento = 'Fecha de vencimiento es requerida';
    if (fechaVenc < hoy) newErrors.vencimiento = 'La fecha no puede ser pasada';
    if (formData.cantidad <= 0) newErrors.cantidad = 'La cantidad debe ser mayor a 0';
    if (formData.precio < 0) newErrors.precio = 'El precio no puede ser negativo';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const productoData = {
      ...formData,
      cantidad: parseInt(formData.cantidad),
      precio: parseFloat(formData.precio),
      vencimiento: formData.vencimiento
    };

    onSubmit(productoData);
  };

  const today = new Date().toISOString().split('T')[0];
  const isGratuito = parseFloat(formData.precio) === 0;

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{producto ? 'Editar Producto' : 'Agregar Producto'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {isGratuito && (
            <Alert variant="info">
              Este producto será marcado como GRATUITO
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Nombre *</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              isInvalid={!!errors.nombre}
            />
            <Form.Control.Feedback type="invalid">
              {errors.nombre}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descripción *</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              isInvalid={!!errors.descripcion}
            />
            <Form.Control.Feedback type="invalid">
              {errors.descripcion}
            </Form.Control.Feedback>
          </Form.Group>

          <div className="row">
            <Form.Group className="mb-3 col-md-6">
              <Form.Label>Fecha de Vencimiento *</Form.Label>
              <Form.Control
                type="date"
                name="vencimiento"
                min={today}
                value={formData.vencimiento}
                onChange={handleChange}
                isInvalid={!!errors.vencimiento}
              />
              <Form.Control.Feedback type="invalid">
                {errors.vencimiento}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3 col-md-3">
              <Form.Label>Cantidad *</Form.Label>
              <Form.Control
                type="number"
                min="1"
                name="cantidad"
                value={formData.cantidad}
                onChange={handleChange}
                isInvalid={!!errors.cantidad}
              />
              <Form.Control.Feedback type="invalid">
                {errors.cantidad}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3 col-md-3">
              <Form.Label>Precio ($) *</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="0.01"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                isInvalid={!!errors.precio}
              />
              <Form.Control.Feedback type="invalid">
                {errors.precio}
              </Form.Control.Feedback>
            </Form.Group>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            {producto ? 'Guardar Cambios' : 'Agregar Producto'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProductoModal;