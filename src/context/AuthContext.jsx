// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../services/firebase";
import { 
  signInWithEmailAndPassword, 
  setPersistence, 
  browserLocalPersistence,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { getUserData } from "../services/userService";
import Swal from "sweetalert2";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función de login mejorada
  const login = async (email, password) => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const cred = await signInWithEmailAndPassword(auth, email, password);

      if (!cred.user.emailVerified) {
        await signOut(auth);
        throw new Error("Debes verificar tu correo antes de iniciar sesión");
      }

      const userInfo = await getUserData(cred.user.uid);
      setUserData({
        uid: cred.user.uid,
        email: cred.user.email,
        ...userInfo
      });

      return userInfo.tipo; // Devuelve el tipo para redirección
    } catch (error) {
      throw error;
    }
  };

  // Función de logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
    } catch (error) {
      throw error;
    }
  };

  // Observador de estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userInfo = await getUserData(user.uid);
          setUserData({
            uid: user.uid,
            email: user.email,
            ...userInfo
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    userData,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);