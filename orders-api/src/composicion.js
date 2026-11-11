import { db } from './config/firebase.js';
import { FirestoreOrderRepository } from './infra/db/FirestoreOrderRepository.js';
import { FirestoreAiSessionRepository } from './infra/db/FirestoreAiSessionRepository.js';
import { CrearPedido } from './aplicacion/casosUso/CrearPedido.js';
import { ListarPedidos } from './aplicacion/casosUso/ListarPedidos.js';
import { OrderController } from './infra/http/controladores/orderController.js';
import { createOrderRouter } from './infra/http/rutas/orderRoutes.js';
import { createAiToolsExecutor } from './infra/ai/aiTools.js';
import { AsistenteOperativoService } from './aplicacion/servicios/AsistenteOperativoService.js';
import { AiController } from './infra/http/controladores/aiController.js';
import { createAiRouter } from './infra/http/rutas/aiRoutes.js';

// Repositorios conectados a Firestore
const orderRepository = new FirestoreOrderRepository(db);
const aiSessionRepository = new FirestoreAiSessionRepository(db);

// Casos de uso de Pedidos
const crearPedido = new CrearPedido(orderRepository);
const listarPedidos = new ListarPedidos(orderRepository);

// Controlador y Router de Pedidos
const orderController = new OrderController({ crearPedido, listarPedidos });
export const orderRouter = createOrderRouter(orderController);

// Módulo Asistente Operativo de IA (Sprint 3)
const toolsExecutor = createAiToolsExecutor({ orderRepository });
const asistenteService = new AsistenteOperativoService({
  sessionRepository: aiSessionRepository,
  toolsExecutor,
});
const aiController = new AiController({
  asistenteService,
  sessionRepository: aiSessionRepository,
});
export const aiRouter = createAiRouter(aiController);
