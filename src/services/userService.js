// src/services/userService.js
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";
import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  initializeAuth,
  browserLocalPersistence
} from "firebase/auth";
import { db, app, secondaryAuth } from "./firebase";

// Definición de tipos de usuario
export const USER_TYPES = {
  ADMIN: 'admin',
  CLIENTE: 'cliente',
  EMPRESA: 'empresa'
};

// ==================== FUNCIONES BASE ====================

/**
 * Guarda los datos de un usuario en Firestore
 * @param {string} uid - ID del usuario
 * @param {object} data - Datos del usuario
 * @param {string} [type=USER_TYPES.CLIENTE] - Tipo de usuario
 * @returns {Promise<boolean>}
 */
export const saveUserData = async (uid, data, type = USER_TYPES.CLIENTE) => {
  try {
    const collectionName = type === USER_TYPES.EMPRESA ? 'empresas' : 'usuarios';
    await setDoc(doc(db, collectionName, uid), {
      ...data,
      tipo: type,
      fechaRegistro: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Error saving user data:", error);
    throw error;
  }
};

/**
 * Obtiene los datos de un usuario desde Firestore
 * @param {string} uid - ID del usuario
 * @returns {Promise<object>}
 */
export const getUserData = async (uid) => {
  try {
    // Primero verificar si es empresa
    const empresaDoc = await getDoc(doc(db, "empresas", uid));
    if (empresaDoc.exists()) return empresaDoc.data();
    
    // Si no es empresa, verificar usuario normal
    const userDoc = await getDoc(doc(db, "usuarios", uid));
    if (userDoc.exists()) return userDoc.data();
    
    throw new Error("Usuario no encontrado");
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
};

/**
 * Actualiza los datos de un usuario
 * @param {string} userId - ID del usuario
 * @param {object} newData - Nuevos datos a actualizar
 * @returns {Promise<boolean>}
 */
export const updateUserData = async (userId, newData) => {
  try {
    // Primero intentamos actualizar en empresas
    const empresaRef = doc(db, 'empresas', userId);
    const empresaSnap = await getDoc(empresaRef);
    
    if (empresaSnap.exists()) {
      await updateDoc(empresaRef, {
        ...newData,
        updatedAt: new Date().toISOString()
      });
      return true;
    }

    // Si no es empresa, intentamos actualizar en usuarios
    const userRef = doc(db, 'usuarios', userId);
    await updateDoc(userRef, {
      ...newData,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
};

// ==================== FUNCIONES PARA CLIENTES ====================

export const getClientes = async () => {
  try {
    const q = query(collection(db, "usuarios"), where("tipo", "==", USER_TYPES.CLIENTE));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting clients:", error);
    throw new Error("Error al obtener los clientes");
  }
};

export const deleteCliente = async (id) => {
  try {
    await deleteDoc(doc(db, "usuarios", id));
    return true;
  } catch (error) {
    console.error("Error deleting client:", error);
    throw new Error("No se pudo eliminar el cliente");
  }
};

export const registerClientWithAuth = async (email, password, userData) => {
  try {
    if (!secondaryAuth) {
      throw new Error("Error de configuración: secondaryAuth no está disponible");
    }

    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    await sendEmailVerification(cred.user);
    
    await saveUserData(cred.user.uid, {
      ...userData,
      email: email
    }, USER_TYPES.CLIENTE);

    await signOut(secondaryAuth);
    return cred.user;
  } catch (error) {
    console.error("Error en registro:", error);
    
    let errorMessage = "Error al registrar el cliente";
    if (error.code === "auth/email-already-in-use") {
      errorMessage = "El correo electrónico ya está en uso";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "La contraseña debe tener al menos 6 caracteres";
    }
    
    throw new Error(errorMessage);
  }
};

export const updateCliente = async (id, clientData) => {
  try {
    await updateDoc(doc(db, "usuarios", id), {
      ...clientData,
      fechaActualizacion: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Error updating client:", error);
    throw new Error("No se pudo actualizar el cliente");
  }
};

// ==================== FUNCIONES PARA ADMINISTRADORES ====================

export const getAdministradores = async () => {
  try {
    const q = query(collection(db, "usuarios"), where("tipo", "==", USER_TYPES.ADMIN));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting administrators:", error);
    throw error;
  }
};

export const addAdministrador = async (adminData) => {
  try {
    const newAdminRef = doc(collection(db, "usuarios")); 
    await setDoc(newAdminRef, { 
      ...adminData, 
      tipo: USER_TYPES.ADMIN 
    });
    return { id: newAdminRef.id, ...adminData };
  } catch (error) {
    console.error("Error adding administrator:", error);
    throw error;
  }
};

export const updateAdministrador = async (id, adminData) => {
  try {
    await updateDoc(doc(db, "usuarios", id), adminData);
    return true;
  } catch (error) {
    console.error("Error updating administrator:", error);
    throw error;
  }
};

export const deleteAdministrador = async (id) => {
  try {
    await deleteDoc(doc(db, "usuarios", id));
    return true;
  } catch (error) {
    console.error("Error deleting administrator:", error);
    throw error;
  }
};

// ==================== FUNCIONES PARA EMPRESAS ====================

export const getEmpresas = async () => {
  try {
    const snapshot = await getDocs(collection(db, "empresas"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting companies:", error);
    throw error;
  }
};

export const registerEmpresaWithAuth = async (email, password, empresaData) => {
  try {
    const secondaryAuth = initializeAuth(app, {
      persistence: browserLocalPersistence
    });

    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    await sendEmailVerification(cred.user);

    await saveUserData(cred.user.uid, {
      ...empresaData,
      email: email
    }, USER_TYPES.EMPRESA);

    await signOut(secondaryAuth);
    return cred.user;
  } catch (error) {
    console.error("Error registering company with auth:", error);
    throw error;
  }
};

export const addEmpresa = async (empresaData) => {
  try {
    if (!empresaData.nombre?.trim()) {
      throw new Error('El nombre no puede estar vacío');
    }

    if (!/^[0-9]{7,8}-[0-9kK]{1}$/.test(empresaData.rut)) {
      throw new Error('RUT inválido. Formato: 12345678-5');
    }

    const docRef = await addDoc(collection(db, "empresas"), {
      ...empresaData,
      tipo: USER_TYPES.EMPRESA,
      fechaRegistro: new Date().toISOString(),
      estado: 'activa'
    });
    
    return { id: docRef.id, ...empresaData };
  } catch (error) {
    console.error("Error adding company:", error);
    throw error;
  }
};

export const updateEmpresa = async (id, empresaData) => {
  try {
    if (!empresaData.nombre || !empresaData.rut || !empresaData.email) {
      throw new Error('Nombre, RUT y email son campos requeridos');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(empresaData.email)) {
      throw new Error('El formato del email no es válido');
    }

    if (!/^[0-9]{7,8}-[0-9kK]{1}$/.test(empresaData.rut)) {
      throw new Error('El formato del RUT no es válido (ej: 12345678-5)');
    }

    await updateDoc(doc(db, "empresas", id), {
      ...empresaData,
      fechaActualizacion: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Error updating company:", error);
    throw error;
  }
};

export const deleteEmpresa = async (id) => {
  try {
    const productos = await getProductosByEmpresa(id);
    if (productos.length > 0) {
      throw new Error('No se puede eliminar: la empresa tiene productos asociados');
    }

    const q = query(collection(db, "usuarios"), where("empresaId", "==", id));
    const usuariosSnapshot = await getDocs(q);
    if (!usuariosSnapshot.empty) {
      throw new Error('No se puede eliminar: la empresa tiene usuarios asociados');
    }

    await deleteDoc(doc(db, "empresas", id));
    return true;
  } catch (error) {
    console.error("Error deleting company:", error);
    throw error;
  }
};

export const checkEmpresaDependencies = async (empresaId) => {
  try {
    const [productos, usuarios] = await Promise.all([
      getProductosByEmpresa(empresaId),
      getDocs(query(collection(db, "usuarios"), where("empresaId", "==", empresaId)))
    ]);

    if (productos.length > 0 || !usuarios.empty) {
      return {
        hasDependencies: true,
        message: 'La empresa tiene relaciones con otros datos'
      };
    }
    return { hasDependencies: false };
  } catch (error) {
    console.error("Error checking company dependencies:", error);
    throw error;
  }
};

// ==================== FUNCIONES ADICIONALES ====================

export const checkEmailExists = async (email) => {
  try {
    const qEmpresas = query(
      collection(db, "empresas"), 
      where("email", "==", email.trim().toLowerCase())
    );
    const empresaSnapshot = await getDocs(qEmpresas);
    
    const qUsuarios = query(
      collection(db, "usuarios"), 
      where("email", "==", email.trim().toLowerCase())
    );
    const usuarioSnapshot = await getDocs(qUsuarios);
    
    return !empresaSnapshot.empty || !usuarioSnapshot.empty;
  } catch (error) {
    console.error("Error al verificar email:", error);
    throw new Error("Error al verificar disponibilidad del email");
  }
};

// ==================== FUNCIONES PARA PRODUCTOS ====================

export const getProductosByEmpresa = async (empresaId) => {
  try {
    const q = query(
      collection(db, "productos"), 
      where("empresaId", "==", empresaId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting products by company:", error);
    throw error;
  }
};

export const createProducto = async (productoData, empresaId) => {
  try {
    const docRef = await addDoc(collection(db, "productos"), {
      ...productoData,
      empresaId,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProducto = async (productoId, productoData) => {
  try {
    await updateDoc(doc(db, "productos", productoId), productoData);
    return true;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProducto = async (productoId) => {
  try {
    await deleteDoc(doc(db, "productos", productoId));
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};