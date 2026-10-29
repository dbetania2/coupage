/**
 * Utilidades de Autenticación para Coupage (T11 / T12)
 * Maneja el almacenamiento en localStorage y Cookies sincronizadas
 * para que tanto el cliente como los layouts de Next.js puedan validar la sesión.
 */

export const ACCESS_TOKEN_KEY = 'coupage_access_token';
export const REFRESH_TOKEN_KEY = 'coupage_refresh_token';

/**
 * Guarda los tokens JWT tanto en localStorage como en Cookies
 */
export function setAuthTokens(access: string, refresh?: string) {
  if (typeof window === 'undefined') return;

  // 1. Guardar en localStorage (todas las variantes para compatibilidad total)
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem('access_token', access);
  localStorage.setItem('token', access);
  if (refresh) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    localStorage.setItem('refresh_token', refresh);
  }

  // 2. Guardar en Cookies para compatibilidad con Middleware y SSR
  const isSecure = window.location.protocol === 'https:';
  document.cookie = `${ACCESS_TOKEN_KEY}=${encodeURIComponent(access)}; path=/; max-age=86400; SameSite=Lax${isSecure ? '; Secure' : ''}`;
  document.cookie = `access_token=${encodeURIComponent(access)}; path=/; max-age=86400; SameSite=Lax${isSecure ? '; Secure' : ''}`;
  if (refresh) {
    document.cookie = `${REFRESH_TOKEN_KEY}=${encodeURIComponent(refresh)}; path=/; max-age=604800; SameSite=Lax${isSecure ? '; Secure' : ''}`;
  }
}

/**
 * Obtiene el access token actual
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  const local = localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem('access_token') || localStorage.getItem('token');
  if (local) return local;

  // Fallback leyendo de cookies
  const match = document.cookie.match(new RegExp('(^| )' + ACCESS_TOKEN_KEY + '=([^;]+)')) ||
                document.cookie.match(new RegExp('(^| )access_token=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Obtiene el refresh token actual
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  const local = localStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem('refresh_token');
  if (local) return local;

  const match = document.cookie.match(new RegExp('(^| )' + REFRESH_TOKEN_KEY + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Cierra la sesión eliminando los tokens de localStorage y Cookies
 */
export function clearAuthTokens() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('access_token');
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');

  // Expirar cookies
  document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  document.cookie = `access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  document.cookie = `${REFRESH_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

/**
 * Comprueba si el usuario tiene una sesión activa con token
 */
export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

/**
 * Decodifica el payload de un token JWT
 */
export function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

