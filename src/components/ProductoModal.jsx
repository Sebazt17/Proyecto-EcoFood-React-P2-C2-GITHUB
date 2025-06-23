import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import CerrarSesion from './CerrarSesion';  

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
    let error = '';
    
    // Validación para el campo nombre
    if (name === 'nombre') {
      const trimmed = value.trim();
      if (!trimmed) {
        error = validations.nombre.required;
      } else if (trimmed.length < validations.nombre.minLength.value) {
        error = validations.nombre.minLength.message;
      } else if (trimmed.length > validations.nombre.maxLength.value) {
        error = validations.nombre.maxLength.message;
      } else if (validations.nombre.pattern && !validations.nombre.pattern.value.test(trimmed)) {
        error = validations.nombre.pattern.message;
      }
    }
    // Validación para el campo descripción
    else if (name === 'descripcion') {
      const trimmed = value.trim();
      if (!trimmed) {
        error = validations.descripcion.required;
      } else if (trimmed.length < validations.descripcion.minLength.value) {
        error = validations.descripcion.minLength.message;
      } else if (trimmed.length > validations.descripcion.maxLength.value) {
        error = validations.descripcion.maxLength.message;
      }
    }
    // Validación para el campo cantidad
    else if (name === 'cantidad') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        error = "Debe ser un número";
      } else if (numValue < validations.cantidad.min.value) {
        error = validations.cantidad.min.message;
      } else if (numValue > validations.cantidad.max.value) {
        error = validations.cantidad.max.message;
      }
    }
    // Validación para el campo precio
    else if (name === 'precio') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        error = "Debe ser un número";
      } else if (numValue < validations.precio.min.value) {
        error = validations.precio.min.message;
      } else if (numValue > validations.precio.max.value) {
        error = validations.precio.max.message;
      } else if (validations.precio.pattern && !validations.precio.pattern.value.test(value)) {
        error = validations.precio.pattern.message;
      }
    }
    // Validación para el campo vencimiento
    else if (name === 'vencimiento' && value) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const vencimiento = new Date(value);
      if (vencimiento < hoy) {
        error = validations.vencimiento.validate(value);
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
    
    // Validación final antes de enviar
    const finalErrors = {};
    Object.keys(formData).forEach(key => {
      if (validations[key]) {
        const error = validateField(key, formData[key]);
        if (error) finalErrors[key] = error;
      }
    });
    
    if (Object.keys(finalErrors).length === 0) {
      onSubmit(formData);
    } else {
      setErrors(finalErrors);
    }
  };

  const validateField = (name, value) => {
    if (!validations[name]) return null;
    
    const rules = validations[name];
    
    // Validación de campo requerido
    if (rules.required && !value.trim()) {
      return rules.required;
    }
    
    // Validación de longitud mínima
    if (rules.minLength && value.length < rules.minLength.value) {
      return rules.minLength.message;
    }
    
    // Validación de longitud máxima
    if (rules.maxLength && value.length > rules.maxLength.value) {
      return rules.maxLength.message;
    }
    
    // Validación de patrón (regex)
    if (rules.pattern && !rules.pattern.value.test(value)) {
      return rules.pattern.message;
    }
    
    // Validación de valor mínimo
    if (rules.min && Number(value) < rules.min.value) {
      return rules.min.message;
    }
    
    // Validación de valor máximo
    if (rules.max && Number(value) > rules.max.value) {
      return rules.max.message;
    }
    
    // Validación personalizada
    if (rules.validate) {
      const customError = rules.validate(value);
      if (typeof customError === 'string') return customError;
    }
    
    return null;
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
              maxLength={validations?.nombre?.maxLength?.value || 50}
            />
            <Form.Control.Feedback type="invalid">
              {errors.nombre}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              {formData.nombre.length}/{validations?.nombre?.maxLength?.value || 50} caracteres
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
              maxLength={validations?.descripcion?.maxLength?.value}
            />
            <Form.Control.Feedback type="invalid">
              {errors.descripcion}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              {formData.descripcion.length}/{validations?.descripcion?.maxLength?.value} caracteres
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
                min={validations?.cantidad?.min?.value || 0}
                max={validations?.cantidad?.max?.value || 10000}
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
                min={validations?.precio?.min?.value || 0}
                max={validations?.precio?.max?.value || 1000000}
                step="0.01"
              />
              <Form.Control.Feedback type="invalid">
                {errors.precio}
              </Form.Control.Feedback>
            </Form.Group>
          </div>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} className="me-2">
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={Object.values(errors).some(error => error)}
          >
            {producto ? 'Guardar Cambios' : 'Agregar Producto'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProductoModal;