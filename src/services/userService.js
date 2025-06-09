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
  signOut // Añade signOut si no lo tienes
} from "firebase/auth";
import { db, secondaryAuth } from "./firebase"; // Importación correcta desde el mismo directorio


// Definición de tipos de usuario
export const USER_TYPES = {
  ADMIN: 'admin',
  CLIENTE: 'cliente',
  EMPRESA: 'empresa'
};

// --- Funciones Base de Usuario ---

/**
 * Guarda los datos de un usuario en Firestore
 * @param {string} uid - ID del usuario
 * @param {object} data - Datos del usuario
 * @param {string} [type=USER_TYPES.CLIENTE] - Tipo de usuario
 * @returns {Promise<boolean>}
 */
export const saveUserData = async (uid, data, type = USER_TYPES.CLIENTE) => {
  try {
    // Determinar la colección según el tipo de usuario
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

// Funciones CRUD para Clientes mejoradas

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
    // Verifica que secondaryAuth esté definido
    if (!secondaryAuth) {
      throw new Error("Error de configuración: secondaryAuth no está disponible");
    }

    // Usamos la autenticación secundaria
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    
    // Enviar verificación de email
    await sendEmailVerification(cred.user);
    
    // Guardar en Firestore
    await saveUserData(cred.user.uid, {
      ...userData,
      email: email
    }, USER_TYPES.CLIENTE);

    // Cerrar sesión en la instancia secundaria
    await signOut(secondaryAuth);
    
    return cred.user;

  } catch (error) {
    console.error("Error en registro:", error);
    
    // Mensaje más amigable para el usuario
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

// --- Funciones CRUD para Administradores ---

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

// --- Funciones CRUD para Empresas ---

export const getEmpresas = async () => {
  try {
    const snapshot = await getDocs(collection(db, "empresas"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting companies:", error);
    throw error;
  }
};

/**
 * Registra una nueva empresa con autenticación
 * @param {string} email 
 * @param {string} password 
 * @param {object} empresaData 
 * @returns {Promise<object>}
 */
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

    await secondaryAuth.signOut();
    return cred.user;
  } catch (error) {
    console.error("Error registering company with auth:", error);
    throw error;
  }
};

export const addEmpresa = async (empresaData) => {
  try {
    const docRef = await addDoc(collection(db, "empresas"), {
      ...empresaData,
      tipo: USER_TYPES.EMPRESA
    });
    return { id: docRef.id, ...empresaData };
  } catch (error) {
    console.error("Error adding company:", error);
    throw error;
  }
};

export const updateEmpresa = async (id, empresaData) => {
  try {
    await updateDoc(doc(db, "empresas", id), empresaData);
    return true;
  } catch (error) {
    console.error("Error updating company:", error);
    throw error;
  }
};

export const deleteEmpresa = async (id) => {
  try {
    await deleteDoc(doc(db, "empresas", id));
    return true;
  } catch (error) {
    console.error("Error deleting company:", error);
    throw error;
  }
};

// --- Funciones para Productos ---

/**
 * Obtiene productos de una empresa específica
 * @param {string} empresaId 
 * @returns {Promise<Array>}
 */
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

/**
 * Crea un nuevo producto para una empresa
 * @param {object} productoData 
 * @param {string} empresaId 
 * @returns {Promise<string>} ID del producto creado
 */
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