// Caso de uso: consulta pedidos con filtros opcionales
export class ListarPedidos {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  async ejecutar(filtros = {}) {
    return await this.orderRepository.obtenerTodos(filtros);
  }
}

