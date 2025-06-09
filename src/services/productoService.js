import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

export const getProductosByEmpresa = async (empresaId) => {
  try {
    const q = query(collection(db, "productos"), where("empresaId", "==", empresaId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Manejo robusto de la fecha de vencimiento
      let vencimientoFormatted = '';
      try {
        // Si es un Timestamp de Firestore
        if (data.vencimiento instanceof Timestamp) {
          vencimientoFormatted = data.vencimiento.toDate().toISOString().split('T')[0];
        } 
        // Si ya es una cadena ISO (como "2023-12-31")
        else if (typeof data.vencimiento === 'string') {
          // Validar que sea una fecha válida
          if (!isNaN(new Date(data.vencimiento).getTime())) {
            vencimientoFormatted = data.vencimiento.split('T')[0];
          }
        }
      } catch (error) {
        console.error("Error formateando fecha:", error);
      }

      return {
        id: doc.id,
        ...data,
        vencimiento: vencimientoFormatted || '' // Valor por defecto si falla el formateo
      };
    });
  } catch (error) {
    console.error("Error en getProductosByEmpresa:", error);
    throw error;
  }
};

export const createProducto = async (productoData) => {
  try {
    // Convertir vencimiento a Timestamp si es una cadena
    const productoParaFirestore = {
      ...productoData,
      vencimiento: productoData.vencimiento ? 
        (typeof productoData.vencimiento === 'string' ? 
          Timestamp.fromDate(new Date(productoData.vencimiento)) : 
          productoData.vencimiento) : 
        null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "productos"), productoParaFirestore);
    
    return { 
      id: docRef.id, 
      ...productoData,
      vencimiento: productoData.vencimiento // Mantener el formato original
    };
  } catch (error) {
    console.error("Error en createProducto:", error);
    throw error;
  }
};

export const updateProducto = async (productoId, productoData) => {
  try {
    // Convertir vencimiento a Timestamp si es necesario
    const updateData = {
      ...productoData,
      vencimiento: productoData.vencimiento ? 
        (typeof productoData.vencimiento === 'string' ? 
          Timestamp.fromDate(new Date(productoData.vencimiento)) : 
          productoData.vencimiento) : 
        null,
      updatedAt: serverTimestamp()
    };

    await updateDoc(doc(db, "productos", productoId), updateData);
  } catch (error) {
    console.error("Error en updateProducto:", error);
    throw error;
  }
};

export const deleteProducto = async (productoId) => {
  try {
    await deleteDoc(doc(db, "productos", productoId));
  } catch (error) {
    console.error("Error en deleteProducto:", error);
    throw error;
  }
};

export const determinarEstadoProducto = (producto) => {
  try {
    const hoy = new Date();
    let vencimientoDate;

    // Convertir vencimiento a Date
    if (producto.vencimiento instanceof Timestamp) {
      vencimientoDate = producto.vencimiento.toDate();
    } else if (typeof producto.vencimiento === 'string') {
      vencimientoDate = new Date(producto.vencimiento);
    } else {
      return 'disponible'; // Si no hay fecha, considerar como disponible
    }

    const diffDays = Math.ceil((vencimientoDate - hoy) / (1000 * 60 * 60 * 24));

    if (producto.cantidad <= 0) return 'agotado';
    if (producto.precio <= 0) return 'gratuito';
    if (vencimientoDate < hoy) return 'vencido';
    if (diffDays <= 3) return 'porVencer';
    return 'disponible';
  } catch (error) {
    console.error("Error en determinarEstadoProducto:", error);
    return 'disponible'; // Valor por defecto en caso de error
  }
};