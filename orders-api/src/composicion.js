import { db } from './config/firebase.js';
import { FirestoreOrderRepository } from './infra/db/FirestoreOrderRepository.js';
import { CrearPedido } from './aplicacion/casosUso/CrearPedido.js';
import { ListarPedidos } from './aplicacion/casosUso/ListarPedidos.js';
import { OrderController } from './infra/http/controladores/orderController.js';
import { createOrderRouter } from './infra/http/rutas/orderRoutes.js';

// Repositorio conectado a Firestore
const orderRepository = new FirestoreOrderRepository(db);

// Casos de uso con dependencias inyectadas
const crearPedido = new CrearPedido(orderRepository);
const listarPedidos = new ListarPedidos(orderRepository);

// Controlador HTTP
const orderController = new OrderController({ crearPedido, listarPedidos });

// Router listo para Express
export const orderRouter = createOrderRouter(orderController);
