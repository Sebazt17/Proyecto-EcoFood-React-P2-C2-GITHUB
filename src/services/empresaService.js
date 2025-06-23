// src/services/empresaService.js
import { db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export const updateEmpresaProfile = async (empresaId, data) => {
  try {
    const empresaRef = doc(db, "empresas", empresaId);
    await updateDoc(empresaRef, data);
  } catch (error) {
    console.error("Error updating empresa profile:", error);
    throw error;
  }
};

export const aprobarPedido = async (pedidoId) => {
  try {
    const pedidoRef = doc(db, 'pedidos', pedidoId);
    const pedidoSnap = await getDoc(pedidoRef);
    if (!pedidoSnap.exists()) throw new Error('Pedido no encontrado');

    const pedido = pedidoSnap.data();

    const productoRef = doc(db, 'productos', pedido.productoId);
    const productoSnap = await getDoc(productoRef);
    if (!productoSnap.exists()) throw new Error('Producto no encontrado');

    const producto = productoSnap.data();

    const nuevoStock = producto.cantidad - pedido.cantidadSolicitada;

    await updateDoc(productoRef, {
      cantidad: nuevoStock,
      estado: nuevoStock <= 0 ? 'agotado' : producto.estado
    });

    await updateDoc(pedidoRef, {
      estado: 'aprobado'
    });

  } catch (error) {
    console.error('Error al aprobar pedido:', error);
    throw error;
  }
};

export const rechazarPedido = async (pedidoId) => {
  try {
    const pedidoRef = doc(db, 'pedidos', pedidoId);
    await updateDoc(pedidoRef, {
      estado: 'rechazado'
    });
  } catch (error) {
    console.error('Error al rechazar pedido:', error);
    throw error;
  }
};
