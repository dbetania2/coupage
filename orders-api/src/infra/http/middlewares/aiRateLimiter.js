/**
 * Middleware de Rate Limiting en memoria para proteger la cuota del motor de IA.
 * Limita la cantidad de consultas por ventana de 60 segundos por IP.
 */

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = Number(process.env.AI_RATE_LIMIT_PER_MIN || 12);

const requestBuckets = new Map();

function cleanExpiredTimestamps(now, timestamps) {
  return timestamps.filter((ts) => now - ts < WINDOW_MS);
}

export function getAiRateLimitSnapshot() {
  const now = Date.now();
  let activeRequests = 0;

  for (const [ip, timestamps] of requestBuckets.entries()) {
    const valid = cleanExpiredTimestamps(now, timestamps);
    if (valid.length === 0) {
      requestBuckets.delete(ip);
    } else {
      requestBuckets.set(ip, valid);
      activeRequests = Math.max(activeRequests, valid.length);
    }
  }

  return {
    usedInWindow: activeRequests,
    maxPerMinute: MAX_REQUESTS_PER_WINDOW,
    remainingInWindow: Math.max(0, MAX_REQUESTS_PER_WINDOW - activeRequests),
    windowSeconds: 60,
  };
}

export function aiRateLimiter(req, res, next) {
  const now = Date.now();
  const clientKey = req.ip || req.headers['x-forwarded-for'] || 'local-admin';
  const previous = requestBuckets.get(clientKey) || [];
  const validTimestamps = cleanExpiredTimestamps(now, previous);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = validTimestamps[0];
    const retryAfterSec = Math.max(1, Math.ceil((WINDOW_MS - (now - oldest)) / 1000));

    res.setHeader('Retry-After', String(retryAfterSec));
    res.setHeader('X-RateLimit-Limit', String(MAX_REQUESTS_PER_WINDOW));
    res.setHeader('X-RateLimit-Remaining', '0');

    return res.status(429).json({
      status: 'error',
      code: 'AI_RATE_LIMIT_EXCEEDED',
      message: `Límite de consultas alcanzado (${MAX_REQUESTS_PER_WINDOW} por minuto). Esperá ${retryAfterSec}s antes de enviar otra consulta para cuidar la cuota de tokens.`,
      retryAfterSeconds: retryAfterSec,
    });
  }

  validTimestamps.push(now);
  requestBuckets.set(clientKey, validTimestamps);

  res.setHeader('X-RateLimit-Limit', String(MAX_REQUESTS_PER_WINDOW));
  res.setHeader('X-RateLimit-Remaining', String(MAX_REQUESTS_PER_WINDOW - validTimestamps.length));
  return next();
}

