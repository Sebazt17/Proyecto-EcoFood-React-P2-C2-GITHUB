import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import Swal from 'sweetalert2';
import { Form, Button, Card, Container, Row, Col, Alert } from 'react-bootstrap';

const PerfilEmpresa = ({ empresaId }) => {
  const [empresa, setEmpresa] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    comuna: '',
    telefono: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchEmpresa = async () => {
      const docRef = doc(db, "empresas", empresaId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setEmpresa(data);
        setFormData({
          nombre: data.nombre || '',
          direccion: data.direccion || '',
          comuna: data.comuna || '',
          telefono: data.telefono || ''
        });
      }
    };

    fetchEmpresa();
  }, [empresaId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validación simple
    if (name === 'nombre' && !value.trim()) {
      setErrors(prev => ({...prev, nombre: 'Nombre es requerido'}));
    } else {
      setErrors(prev => ({...prev, [name]: ''}));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'Nombre es requerido';
    if (!formData.direccion.trim()) newErrors.direccion = 'Dirección es requerida';
    if (!formData.comuna.trim()) newErrors.comuna = 'Comuna es requerida';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const empresaRef = doc(db, "empresas", empresaId);
      await updateDoc(empresaRef, formData);
      setEmpresa(formData);
      setEditMode(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Perfil actualizado',
        text: 'Los cambios se guardaron correctamente'
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el perfil'
      });
    }
  };

  if (!empresa) return <div className="text-center mt-5">Cargando perfil...</div>;

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h3>Perfil Empresarial</h3>
          {editMode ? (
            <div>
              <Button variant="success" className="me-2" onClick={handleSave}>
                Guardar Cambios
              </Button>
              <Button variant="secondary" onClick={() => setEditMode(false)}>
                Cancelar
              </Button>
            </div>
          ) : (
            <Button variant="primary" onClick={() => setEditMode(true)}>
              Editar Perfil
            </Button>
          )}
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control 
                  type="email" 
                  value={empresa.email} 
                  disabled 
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre de la empresa *</Form.Label>
                {editMode ? (
                  <>
                    <Form.Control
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      isInvalid={!!errors.nombre}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.nombre}
                    </Form.Control.Feedback>
                  </>
                ) : (
                  <Form.Control
                    type="text"
                    value={empresa.nombre}
                    disabled
                  />
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Dirección *</Form.Label>
                {editMode ? (
                  <>
                    <Form.Control
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      isInvalid={!!errors.direccion}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.direccion}
                    </Form.Control.Feedback>
                  </>
                ) : (
                  <Form.Control
                    type="text"
                    value={empresa.direccion || 'No especificado'}
                    disabled
                  />
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Comuna *</Form.Label>
                {editMode ? (
                  <>
                    <Form.Control
                      type="text"
                      name="comuna"
                      value={formData.comuna}
                      onChange={handleInputChange}
                      isInvalid={!!errors.comuna}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.comuna}
                    </Form.Control.Feedback>
                  </>
                ) : (
                  <Form.Control
                    type="text"
                    value={empresa.comuna || 'No especificado'}
                    disabled
                  />
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Teléfono</Form.Label>
                {editMode ? (
                  <Form.Control
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                  />
                ) : (
                  <Form.Control
                    type="tel"
                    value={empresa.telefono || 'No especificado'}
                    disabled
                  />
                )}
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PerfilEmpresa;