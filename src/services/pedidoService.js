// src/services/pedidoService.js
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';

export const crearPedido = async (pedidoData) => {
  try {
    // Obtener información adicional del producto
    const productoRef = doc(db, 'productos', pedidoData.productoId);
    const productoSnap = await getDoc(productoRef);
    
    if (!productoSnap.exists()) {
      throw new Error('El producto no existe');
    }

    const producto = productoSnap.data();
    
    const pedidoCompleto = {
      ...pedidoData,
      productoNombre: producto.nombre,
      empresaNombre: producto.empresaNombre,
      fecha: new Date().toISOString(),
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