import { Router } from 'express';
import { aiRateLimiter } from '../middlewares/aiRateLimiter.js';

export function createAiRouter(aiController) {
  const router = Router();

  // Estado y diagnóstico del motor de IA + Cuota de Tokens
  router.get('/status', aiController.obtenerEstado);

  // Gestión de Sesiones Persistidas en Cloud Firestore
  router.get('/sessions', aiController.listarSesiones);
  router.get('/sessions/:id', aiController.obtenerSesion);
  router.delete('/sessions/:id', aiController.eliminarSesion);

  // Endpoint principal de consulta con Rate Limiting y Tool Calling
  router.post('/chat', aiRateLimiter, aiController.chat);

  return router;
}

