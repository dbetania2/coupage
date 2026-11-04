/**
 * src/dominio/entidades/Order.js
 * 
 * Entidad pura del Dominio (Arquitectura Hexagonal).
 * NO importa Express, Firebase ni ninguna librería externa.
 */

import { ReglaDeNegocioError, TransicionInvalidaError } from '../errores/ErroresDominio.js';

export const ESTADOS_ORDEN = {
  PENDIENTE: 'PENDIENTE',
  CONFIRMADO: 'CONFIRMADO',
  PREPARADO: 'PREPARADO',
  ENTREGADO: 'ENTREGADO',
  CANCELADO: 'CANCELADO',
  RECHAZADO: 'RECHAZADO'
};

// Estados terminales que nunca pueden volver a modificarse
const ESTADOS_TERMINALES = [
  ESTADOS_ORDEN.ENTREGADO,
  ESTADOS_ORDEN.CANCELADO,
  ESTADOS_ORDEN.RECHAZADO
];

// Transiciones válidas según la máquina de estados del negocio
const TRANSICIONES_VALIDAS = {
  [ESTADOS_ORDEN.PENDIENTE]: [ESTADOS_ORDEN.CONFIRMADO, ESTADOS_ORDEN.CANCELADO, ESTADOS_ORDEN.RECHAZADO],
  [ESTADOS_ORDEN.CONFIRMADO]: [ESTADOS_ORDEN.PREPARADO, ESTADOS_ORDEN.CANCELADO, ESTADOS_ORDEN.RECHAZADO],
  [ESTADOS_ORDEN.PREPARADO]: [ESTADOS_ORDEN.ENTREGADO],
  [ESTADOS_ORDEN.ENTREGADO]: [],
  [ESTADOS_ORDEN.CANCELADO]: [],
  [ESTADOS_ORDEN.RECHAZADO]: []
};

export class Order {
  constructor({
    id = null,
    orderNumber,
    customer,
    items,
    totalAmount,
    status = ESTADOS_ORDEN.PENDIENTE,
    history = [],
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    // REGLA 1: Invariante de ítems mínimos
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ReglaDeNegocioError('La orden debe contener al menos un producto.');
    }

    // REGLA 2: Invariante de cantidades positivas
    for (const item of items) {
      if (!item.quantity || item.quantity < 1) {
        throw new ReglaDeNegocioError(`Cantidad inválida para el producto ${item.productName || item.productId}. Debe ser al menos 1.`);
      }
    }

    // REGLA 3: Invariante de datos del comprador
    if (!customer || !customer.name || !customer.email) {
      throw new ReglaDeNegocioError('Los datos del comprador (nombre y email) son obligatorios.');
    }

    this.id = id;
    this.orderNumber = orderNumber;
    this.customer = customer;
    this.items = items;
    this.totalAmount = totalAmount;
    this.status = status;
    this.history = history;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Fábrica para crear una orden nueva desde el checkout
   */
  static crear({ orderNumber, customer, items, totalAmount }) {
    const ahora = new Date();
    const historialInicial = [
      {
        status: ESTADOS_ORDEN.PENDIENTE,
        timestamp: ahora,
        note: 'Solicitud de pedido creada en checkout',
        author: customer.email
      }
    ];

    return new Order({
      orderNumber,
      customer,
      items,
      totalAmount,
      status: ESTADOS_ORDEN.PENDIENTE, // REGLA: Todo pedido nuevo nace en PENDIENTE
      history: historialInicial,
      createdAt: ahora,
      updatedAt: ahora
    });
  }

  /**
   * REGLA 4: Transición controlada según la Máquina de Estados Finita
   */
  cambiarEstado(nuevoEstado, autor = 'sistema', nota = '') {
    // Si ya está en un estado terminal, no se puede tocar
    if (ESTADOS_TERMINALES.includes(this.status)) {
      throw new TransicionInvalidaError(`No se puede modificar una orden en estado terminal: ${this.status}`);
    }

    const destinosPermitidos = TRANSICIONES_VALIDAS[this.status] || [];
    if (!destinosPermitidos.includes(nuevoEstado)) {
      throw new TransicionInvalidaError(`Transición inválida: no se puede pasar de ${this.status} a ${nuevoEstado}.`);
    }

    const ahora = new Date();
    this.status = nuevoEstado;
    this.updatedAt = ahora;

    // REGLA 5: Auditoría e historial inmutable (nunca se borran eventos anteriores)
    this.history.push({
      status: nuevoEstado,
      timestamp: ahora,
      note: nota || `Cambio de estado a ${nuevoEstado}`,
      author: autor
    });
  }

  /**
   * Convierte la entidad a un objeto plano para persistir en Firestore
   */
  toPlainObject() {
    return {
      orderNumber: this.orderNumber,
      customer: this.customer,
      items: this.items,
      totalAmount: this.totalAmount,
      status: this.status,
      history: this.history,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

