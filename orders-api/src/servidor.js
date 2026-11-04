import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import corsMiddleware from './infra/http/middlewares/cors.js';
import { db } from './config/firebase.js';

dotenv.config({ path: path.join(import.meta.dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(corsMiddleware);
app.use(express.json());

// Configuración de Swagger / OpenAPI
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Orders API - Coupage',
      version: '1.0.0',
      description: 'Microservicio de Gestión y Procesamiento de Pedidos para la plataforma Coupage.'
    },
    servers: [
      {
        url: `http://127.0.0.1:${PORT}`,
        description: 'Servidor de Desarrollo Local'
      }
    ]
  },
  apis: ['./src/servidor.js', './src/infra/http/rutas/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /:
 *   get:
 *     summary: Estado de la API de Pedidos
 *     responses:
 *       200:
 *         description: Microservicio activo y respondiendo.
 */
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'orders-api',
    message: 'Microservicio de Pedidos (Orders API) activo y funcionando.',
    version: '1.0.0',
    swagger_docs: `http://127.0.0.1:${PORT}/api-docs`
  });
});

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Liveness Probe
 *     description: Chequeo simple de vida del proceso Node.js.
 *     responses:
 *       200:
 *         description: Event loop activo.
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

/**
 * @openapi
 * /ready:
 *   get:
 *     summary: Readiness Probe
 *     description: Verifica conectividad real con Firestore.
 *     responses:
 *       200:
 *         description: Dependencias conectadas y listas.
 *       503:
 *         description: Falla en la conexión a la base de datos.
 */
app.get('/ready', async (req, res) => {
  try {
    await db.collection('orders').limit(1).get();
    res.json({ status: 'ready', firestore: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'error', firestore: 'disconnected', message: error.message });
  }
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Orders API corriendo exitosamente en http://127.0.0.1:${PORT}`);
  console.log(`📄 Documentación Swagger disponible en http://127.0.0.1:${PORT}/api-docs`);
});

// Apagado ordenado por SIGTERM (Exigido en Sección 11.1 y Bloque 3)
process.on('SIGTERM', () => {
  console.log('🛑 Señal SIGTERM recibida. Cerrando servidor ordenadamente...');
  server.close(() => {
    console.log('✅ Servidor cerrado.');
    process.exit(0);
  });
});

export { app, server };

