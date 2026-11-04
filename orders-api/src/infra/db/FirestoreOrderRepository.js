import { OrderRepository } from '../../dominio/puertos/OrderRepository.js';

// Adaptador secundario para persistir pedidos en Firebase Firestore
export class FirestoreOrderRepository extends OrderRepository {
  constructor(db) {
    super();
    this.collection = db.collection('orders');
  }

  // Guarda un nuevo pedido y Firebase le asigna su ID aleatorio
  async guardar(order) {
    const ordenPlana = {
      orderNumber: order.orderNumber,
      customer: order.customer,
      items: order.items,
      totalAmount: order.totalAmount,
      status: order.status,
      history: order.history,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };

    const docRef = await this.collection.add(ordenPlana);
    return {
      id: docRef.id,
      ...ordenPlana
    };
  }

  // Obtiene los pedidos ordenados del más reciente al más antiguo
  async obtenerTodos(filtros = {}) {
    let query = this.collection;

    if (filtros.status) {
      query = query.where('status', '==', filtros.status);
    }

    const snapshot = await query.get();
    const pedidos = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      // Convierte Timestamps de Firestore a Date de JS si vienen en ese formato
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt;
      const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt;

      pedidos.push({
        id: doc.id,
        ...data,
        createdAt,
        updatedAt
      });
    });

    // Ordena en memoria por fecha descendente
    return pedidos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Busca un pedido específico por su ID de Firebase
  async obtenerPorId(id) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }

    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
    };
  }
}

