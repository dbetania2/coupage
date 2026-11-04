// Puerto / Contrato para desacoplar el dominio de la base de datos
export class OrderRepository {
  async guardar(order) {
    throw new Error('Método guardar no implementado');
  }

  async obtenerTodos(filtros = {}) {
    throw new Error('Método obtenerTodos no implementado');
  }

  async obtenerPorId(id) {
    throw new Error('Método obtenerPorId no implementado');
  }
}

