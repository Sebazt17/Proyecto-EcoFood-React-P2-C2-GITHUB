// src/services/empresaService.js
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export const updateEmpresaProfile = async (empresaId, data) => {
  try {
    const empresaRef = doc(db, "empresas", empresaId);
    await updateDoc(empresaRef, data);
  } catch (error) {
    console.error("Error updating empresa profile:", error);
    throw error;
  }
};