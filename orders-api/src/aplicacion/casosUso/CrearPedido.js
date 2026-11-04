import { Order } from '../../dominio/entidades/Order.js';

// Caso de uso: procesa y guarda un nuevo pedido
export class CrearPedido {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  async ejecutar({ customer, items }) {
    // Genera un código comercial legible (ej: ORD-2026-7842)
    const anio = new Date().getFullYear();
    const sufijoAleatorio = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${anio}-${sufijoAleatorio}`;

    // Recalcula subtotales y total en el servidor para evitar manipulaciones de precio
    let totalAmount = 0;
    const itemsProcesados = items.map(item => {
      const subtotal = Number((item.unitPrice * item.quantity).toFixed(2));
      totalAmount += subtotal;
      return {
        ...item,
        subtotal
      };
    });

    totalAmount = Number(totalAmount.toFixed(2));

    // Crea la entidad del dominio aplicando todas las reglas de negocio
    const orden = Order.crear({
      orderNumber,
      customer,
      items: itemsProcesados,
      totalAmount
    });

    // Guarda en Firestore mediante el repositorio
    return await this.orderRepository.guardar(orden);
  }
}

