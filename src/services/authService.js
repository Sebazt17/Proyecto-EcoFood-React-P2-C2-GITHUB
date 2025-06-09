import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Roles disponibles
export const ROLES = {
  ADMIN: 'admin',
  EMPRESA: 'empresa',
  CLIENTE: 'cliente'
};

// Registrar nuevo usuario con rol
export const registerWithRole = async (email, password, userData, role = ROLES.CLIENTE) => {
  try {
    // Crear usuario en Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Determinar la colección según el rol
    const collectionName = role === ROLES.EMPRESA ? 'empresas' : 'usuarios';
    
    // Crear documento en Firestore con el rol
    await setDoc(doc(db, collectionName, userCredential.user.uid), {
      ...userData,
      email,
      role,
      createdAt: new Date()
    });
    
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Iniciar sesión
export const login = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// Cerrar sesión
export const logout = async () => {
  await signOut(auth);
};

// Recuperar contraseña
export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

// Obtener rol del usuario actual
export const getUserRole = async (userId) => {
  try {
    // Primero verificar si es empresa
    const empresaDoc = await getDoc(doc(db, 'empresas', userId));
    if (empresaDoc.exists()) return empresaDoc.data().role;
    
    // Si no es empresa, verificar si es admin o cliente
    const userDoc = await getDoc(doc(db, 'usuarios', userId));
    if (userDoc.exists()) return userDoc.data().role;
    
    return null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
};

// Obtener datos del usuario actual
export const getCurrentUserData = async (userId) => {
  try {
    // Primero verificar si es empresa
    const empresaDoc = await getDoc(doc(db, 'empresas', userId));
    if (empresaDoc.exists()) return { id: empresaDoc.id, ...empresaDoc.data() };
    
    // Si no es empresa, verificar usuario normal
    const userDoc = await getDoc(doc(db, 'usuarios', userId));
    if (userDoc.exists()) return { id: userDoc.id, ...userDoc.data() };
    
    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};