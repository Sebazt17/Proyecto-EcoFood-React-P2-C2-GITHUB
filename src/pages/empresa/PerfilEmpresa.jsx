import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import Swal from 'sweetalert2';
import { Form, Button, Card, Container, Row, Col, Alert } from 'react-bootstrap';
import { regionesComunas } from '../../data/regionesComunas';
import CerrarSesion from '../../components/CerrarSesion';

const PerfilEmpresa = ({ empresaId }) => {
  const [empresa, setEmpresa] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    region: '',
    comuna: '',
    telefono: '',
    rut: ''
  });
  const [errors, setErrors] = useState({});
  const [comunasList, setComunasList] = useState([]);

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
          region: data.region || '',
          comuna: data.comuna || '',
          telefono: data.telefono || '',
          rut: data.rut || ''
        });
        
        if (data.region) {
          setComunasList(regionesComunas[data.region] || []);
        }
      }
    };

    fetchEmpresa();
  }, [empresaId]);

  const formatRUT = (value) => {
    const cleanValue = value.replace(/[^0-9kK]/g, '');
    if (cleanValue.length <= 8) return cleanValue;
    return `${cleanValue.slice(0, 8)}-${cleanValue.slice(8, 9)}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    
    if (name === 'rut') {
      newValue = formatRUT(value);
    } else if (name === 'telefono') {
      newValue = value.replace(/[^0-9]/g, '');
    } else if (name === 'region') {
      setComunasList(regionesComunas[value] || []);
      setFormData(prev => ({ ...prev, comuna: '' }));
    }
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    validateField(name, newValue);
  };

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'nombre':
        if (!value.trim()) error = 'Nombre es requerido';
        else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{5,50}$/.test(value)) 
          error = 'Debe tener 5-50 caracteres (solo letras y espacios)';
        break;
      case 'direccion':
        if (!value.trim()) error = 'Dirección es requerida';
        else if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s#\-]{5,100}$/.test(value))
          error = 'Debe tener 5-100 caracteres (sin símbolos especiales)';
        break;
      case 'rut':
        if (value && !/^\d{7,8}-[\dkK]$/.test(value))
          error = 'RUT inválido (Formato: 12345678-5)';
        break;
      case 'telefono':
        if (value && !/^\d{8,12}$/.test(value))
          error = 'Teléfono debe tener 8-12 dígitos';
        break;
      case 'region':
        if (!value) error = 'Selecciona una región';
        break;
      case 'comuna':
        if (!value) error = 'Selecciona una comuna';
        break;
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    Object.keys(formData).forEach(field => {
      validateField(field, formData[field]);
    });
    return !Object.values(errors).some(error => error);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Error de validación',
        text: 'Por favor corrige los campos marcados'
      });
      return;
    }

    try {
      const empresaRef = doc(db, "empresas", empresaId);
      await updateDoc(empresaRef, formData);
      setEmpresa(formData);
      setEditMode(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Perfil actualizado',
        text: 'Los cambios se guardaron correctamente',
        timer: 2000
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
      <div className="d-flex justify-content-end mb-3">
        <CerrarSesion variant="outline-danger" size="sm" />
      </div>

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
                <Form.Label>RUT</Form.Label>
                {editMode ? (
                  <>
                    <Form.Control
                      type="text"
                      name="rut"
                      value={formData.rut}
                      onChange={handleInputChange}
                      isInvalid={!!errors.rut}
                      placeholder="12345678-5"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.rut}
                    </Form.Control.Feedback>
                  </>
                ) : (
                  <Form.Control
                    type="text"
                    value={empresa.rut || 'No especificado'}
                    disabled
                  />
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row>
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
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Teléfono</Form.Label>
                {editMode ? (
                  <>
                    <Form.Control
                      type="text"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      isInvalid={!!errors.telefono}
                      maxLength={12}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.telefono}
                    </Form.Control.Feedback>
                  </>
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
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Región *</Form.Label>
                {editMode ? (
                  <>
                    <Form.Select
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      isInvalid={!!errors.region}
                    >
                      <option value="">Selecciona una región</option>
                      {Object.keys(regionesComunas).map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.region}
                    </Form.Control.Feedback>
                  </>
                ) : (
                  <Form.Control
                    type="text"
                    value={empresa.region || 'No especificado'}
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
                    <Form.Select
                      name="comuna"
                      value={formData.comuna}
                      onChange={handleInputChange}
                      isInvalid={!!errors.comuna}
                      disabled={!formData.region}
                    >
                      <option value="">Primero elige una región</option>
                      {comunasList.map(comuna => (
                        <option key={comuna} value={comuna}>{comuna}</option>
                      ))}
                    </Form.Select>
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
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PerfilEmpresa;