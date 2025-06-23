// src/services/pedidoService.js
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from './firebase';

export const crearPedido = async (pedidoData) => {
  try {
    const productoRef = doc(db, 'productos', pedidoData.productoId);
    const productoSnap = await getDoc(productoRef);
    
    if (!productoSnap.exists()) {
      throw new Error('El producto no existe');
    }

    const producto = productoSnap.data();

    const pedidoCompleto = {
      ...pedidoData,
      productoNombre: producto.nombre,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'pendiente'
    };

    const docRef = await addDoc(collection(db, 'pedidos'), pedidoCompleto);
    return { id: docRef.id, ...pedidoCompleto };
  } catch (error) {
    console.error('Error al crear pedido:', error);
    throw error;
  }
};

export const getPedidosByCliente = async (clienteId) => {
  try {
    const q = query(
      collection(db, 'pedidos'),
      where('clienteId', '==', clienteId)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    throw error;
  }
};

export const actualizarEstadoPedido = async (pedidoId, nuevoEstado) => {
  try {
    const pedidoRef = doc(db, 'pedidos', pedidoId);
    await updateDoc(pedidoRef, { estado: nuevoEstado });
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    throw error;
  }
};

export const aprobarPedidoYDescontarStock = async (pedidoId) => {
  try {
    const pedidoRef = doc(db, 'pedidos', pedidoId);
    const pedidoSnap = await getDoc(pedidoRef);
    if (!pedidoSnap.exists()) throw new Error('Pedido no existe');
    const pedido = pedidoSnap.data();

    const productoRef = doc(db, 'productos', pedido.productoId);
    const productoSnap = await getDoc(productoRef);
    if (!productoSnap.exists()) throw new Error('Producto no existe');
    const producto = productoSnap.data();

    const nuevoStock = producto.cantidad - pedido.cantidadSolicitada;
    await updateDoc(productoRef, {
      cantidad: nuevoStock,
      estado: nuevoStock <= 0 ? 'agotado' : producto.estado
    });

    await updateDoc(pedidoRef, { estado: 'aprobado' });
  } catch (err) {
    console.error('Error en aprobarPedidoYDescontarStock:', err);
    throw err;
  }
};
