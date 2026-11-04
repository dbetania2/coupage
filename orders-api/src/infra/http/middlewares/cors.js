import cors from 'cors';

// Orígenes permitidos leídos del entorno
const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

// Configuración de reglas y cabeceras de CORS
const corsOptions = {
  origin: (origin, callback) => {
    // Permite peticiones sin origen (curl/Postman) o dentro de la lista blanca
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Acceso no permitido por política de CORS'));
  },
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
  credentials: true
};

// Middleware exportado para Express
export default cors(corsOptions);
