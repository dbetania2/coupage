const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
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
  apis: ['./index.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /:
 *   get:
 *     summary: Estado de salud de la API de Pedidos
 *     description: Retorna la confirmación de estado activo del microservicio orders-api.
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Orders API corriendo exitosamente en http://127.0.0.1:${PORT}`);
  console.log(`📄 Documentación Swagger disponible en http://127.0.0.1:${PORT}/api-docs`);
});
