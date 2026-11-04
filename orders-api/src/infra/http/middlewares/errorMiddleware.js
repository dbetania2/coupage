import crypto from 'crypto';
import {
  EntidadNoEncontradaError,
  ReglaDeNegocioError,
  TransicionInvalidaError
} from '../../../dominio/errores/ErroresDominio.js';

// Middleware centralizado de errores al final de Express 
export default function errorMiddleware(err, req, res, next) {
  
  // Genera un ID único para rastrear este error en los logs
  const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();

  // Caso 1: Error de validación de Joi
  if (err.isJoi || err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'ValidacionError',
      message: err.details ? err.details[0].message : err.message,
      correlationId
    });
  }

  // Caso 2: Error de regla de negocio rota en el dominio
  if (err instanceof ReglaDeNegocioError) {
    return res.status(400).json({
      error: err.name,
      message: err.message,
      correlationId
    });
  }

  // Caso 3: Recurso o pedido que no existe
  if (err instanceof EntidadNoEncontradaError) {
    return res.status(404).json({
      error: err.name,
      message: err.message,
      correlationId
    });
  }

  // Caso 4: Transición prohibida en la máquina de estados
  if (err instanceof TransicionInvalidaError) {
    return res.status(422).json({
      error: err.name,
      message: err.message,
      correlationId
    });
  }

  // Caso 5: Bloqueo de CORS
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      error: 'CorsError',
      message: err.message,
      correlationId
    });
  }

  // Caso 6: Error inesperado o de base de datos (500)
  // Registra el error real en la consola del servidor con su ID
  console.error(` [ERROR 500] ID: ${correlationId} -`, err);

  // Al cliente en la web se le responde un mensaje seguro sin stack trace ni detalles internos
  return res.status(500).json({
    error: 'ErrorInternoServidor',
    message: 'Ocurrió un error inesperado al procesar la solicitud.',
    correlationId
  });
}

