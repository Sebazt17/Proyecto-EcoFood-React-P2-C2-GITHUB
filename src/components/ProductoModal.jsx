import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const ProductoModal = ({ show, onHide, producto, onSubmit, validations }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    vencimiento: '',
    cantidad: 0,
    precio: 0,
    estado: 'disponible'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        vencimiento: producto.vencimiento || '',
        cantidad: producto.cantidad || 0,
        precio: producto.precio || 0,
        estado: producto.estado || 'disponible'
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        vencimiento: '',
        cantidad: 0,
        precio: 0,
        estado: 'disponible'
      });
    }
    setErrors({});
  }, [producto, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validación en tiempo real
    let error = '';
    if (name === 'nombre') {
      const trimmed = value.trim();
      if (!trimmed) {
        error = "Nombre es requerido";
      } else if (trimmed.length < validations.nombre.minLength || 
                 trimmed.length > validations.nombre.maxLength) {
        error = validations.nombre.message;
      }
    } else if (name === 'descripcion') {
      const trimmed = value.trim();
      if (!trimmed) {
        error = "Descripción es requerida";
      } else if (trimmed.length < validations.descripcion.minLength || 
                 trimmed.length > validations.descripcion.maxLength) {
        error = validations.descripcion.message;
      }
    } else if (name === 'cantidad') {
      const numValue = Number(value);
      if (isNaN(numValue) || 
          numValue < validations.cantidad.min || 
          numValue > validations.cantidad.max) {
        error = validations.cantidad.message;
      }
    } else if (name === 'precio') {
      const numValue = Number(value);
      if (isNaN(numValue) || 
          numValue < validations.precio.min || 
          numValue > validations.precio.max) {
        error = validations.precio.message;
      }
    } else if (name === 'vencimiento' && value) {
      const hoy = new Date();
      const vencimiento = new Date(value);
      if (vencimiento < hoy) {
        error = "La fecha no puede ser anterior a hoy";
      }
    }

    setErrors({
      ...errors,
      [name]: error
    });

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{producto ? 'Editar Producto' : 'Agregar Producto'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nombre *</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              isInvalid={!!errors.nombre}
              maxLength={validations.nombre.maxLength}
            />
            <Form.Control.Feedback type="invalid">
              {errors.nombre}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              {formData.nombre.trim().length}/{validations.nombre.maxLength} caracteres
            </Form.Text>
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
              maxLength={validations.descripcion.maxLength}
            />
            <Form.Control.Feedback type="invalid">
              {errors.descripcion}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              {formData.descripcion.trim().length}/{validations.descripcion.maxLength} caracteres
            </Form.Text>
          </Form.Group>

          <div className="row">
            <Form.Group className="col-md-6 mb-3">
              <Form.Label>Fecha de Vencimiento</Form.Label>
              <Form.Control
                type="date"
                name="vencimiento"
                value={formData.vencimiento}
                onChange={handleChange}
                isInvalid={!!errors.vencimiento}
              />
              <Form.Control.Feedback type="invalid">
                {errors.vencimiento}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="col-md-6 mb-3">
              <Form.Label>Cantidad *</Form.Label>
              <Form.Control
                type="number"
                name="cantidad"
                value={formData.cantidad}
                onChange={handleChange}
                isInvalid={!!errors.cantidad}
                min={validations.cantidad.min}
                max={validations.cantidad.max}
              />
              <Form.Control.Feedback type="invalid">
                {errors.cantidad}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="col-md-6 mb-3">
              <Form.Label>Precio ($) *</Form.Label>
              <Form.Control
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                isInvalid={!!errors.precio}
                min={validations.precio.min}
                max={validations.precio.max}
                step="0.01"
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
          <Button 
            variant="primary" 
            type="submit"
            disabled={Object.keys(errors).some(key => errors[key])}
          >
            {producto ? 'Guardar Cambios' : 'Agregar Producto'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProductoModal;