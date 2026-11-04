// Controlador HTTP para endpoints de pedidos
export class OrderController {
  constructor({ crearPedido, listarPedidos }) {
    this.crearPedido = crearPedido;
    this.listarPedidos = listarPedidos;
  }

  // POST /api/orders
  crear = async (req, res, next) => {
    try {
      const pedidoCreado = await this.crearPedido.ejecutar(req.body);
      return res.status(201).json({
        message: 'Pedido creado exitosamente.',
        order: pedidoCreado
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/orders
  listar = async (req, res, next) => {
    try {
      const { status } = req.query;
      const pedidos = await this.listarPedidos.ejecutar({ status });
      return res.status(200).json(pedidos);
    } catch (error) {
      next(error);
    }
  };
}

