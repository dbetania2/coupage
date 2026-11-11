import cors from 'cors';

// Configuración de reglas y cabeceras de CORS
const corsOptions = {
  origin: (origin, callback) => {
    // Se lee en tiempo de petición para que dotenv.config() ya haya cargado el .env
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    // Permite peticiones sin origen (curl/Postman) o dentro de la lista blanca del .env
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Acceso no permitido por política de CORS'));
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
  credentials: true,
};

// Middleware exportado para Express
export default cors(corsOptions);
