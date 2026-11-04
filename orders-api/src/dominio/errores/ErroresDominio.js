// Clase base para cualquier error de lógica del negocio
export class DominioError extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = this.constructor.name;
  }
}

// Para cuando se rompe una regla de negocio (ej. carrito vacío o cantidades negativas)
export class ReglaDeNegocioError extends DominioError {}

// Para cuando se intenta un cambio de estado prohibido en la orden
export class TransicionInvalidaError extends DominioError {}

// Para cuando se busca una orden o recurso que no existe
export class EntidadNoEncontradaError extends DominioError {}

