// src/context/AuthProvider.jsx
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import { AuthContext } from "./AuthContext";
import { getUserData } from "../services/userService"; // Importar getUserData

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null); // Nuevo estado para los datos del usuario
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    const data = await getUserData(currentUser.uid);
                    setUserData(data);
                } catch (error) {
                    console.error("Error al obtener datos del usuario:", error);
                    setUserData(null); // Limpiar datos del usuario si hay un error
                }
            } else {
                setUserData(null); // Limpiar datos del usuario al cerrar sesión
            }
            setLoading(false);
        });

    return () => unsubscribe();
  }, []);

    if (loading) {
        return <div>Cargando autenticación...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, userData, loading }}>
            {children}
        </AuthContext.Provider>
    );
};