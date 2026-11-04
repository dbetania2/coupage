import { Router } from 'express';
import { validarCrearPedido } from '../middlewares/orderValidator.js';

// Fábrica de rutas para inyectar el controlador
export function createOrderRouter(orderController) {
  const router = Router();

  /**
   * @openapi
   * /api/orders:
   *   get:
   *     summary: Listar pedidos
   *     description: Obtiene todos los pedidos registrados en Firestore, ordenados por fecha descendente.
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [PENDIENTE, CONFIRMADO, PREPARADO, ENTREGADO, CANCELADO, RECHAZADO]
   *         description: Filtra los pedidos por su estado actual
   *     responses:
   *       200:
   *         description: Lista de pedidos obtenida con éxito.
   */
  router.get('/', orderController.listar);

  /**
   * @openapi
   * /api/orders:
   *   post:
   *     summary: Crear una nueva solicitud de pedido
   *     description: Valida el payload con Joi, calcula totales y persiste en Firestore con estado PENDIENTE.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - customer
   *               - items
   *             properties:
   *               customer:
   *                 type: object
   *                 required:
   *                   - name
   *                   - email
   *                   - phone
   *                   - shippingAddress
   *                 properties:
   *                   name:
   *                     type: string
   *                     example: Agustín Del Grecco
   *                   email:
   *                     type: string
   *                     example: agustin@coupage.com
   *                   phone:
   *                     type: string
   *                     example: +54 9 11 4455-6677
   *                   shippingAddress:
   *                     type: string
   *                     example: Av. Libertador 2450, CABA
   *               items:
   *                 type: array
   *                 items:
   *                   type: object
   *                   required:
   *                     - productId
   *                     - saleModeId
   *                     - productName
   *                     - unitPrice
   *                     - quantity
   *                   properties:
   *                     productId:
   *                       type: integer
   *                       example: 1
   *                     saleModeId:
   *                       type: integer
   *                       example: 1
   *                     productName:
   *                       type: string
   *                       example: Rutini Cabernet Malbec
   *                     unitPrice:
   *                       type: number
   *                       example: 18500.00
   *                     quantity:
   *                       type: integer
   *                       example: 2
   *     responses:
   *       201:
   *         description: Pedido creado exitosamente.
   *       400:
   *         description: Error de validación en los datos enviados.
   */
  router.post('/', validarCrearPedido, orderController.crear);

  return router;
}

