'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { setAuthTokens, isAuthenticated } from '@/lib/auth';
import styles from './login.module.css';

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Si ya tiene sesión activa con token, redirigir automáticamente
  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/admin');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      setErrorMessage('Por favor ingrese tanto el usuario como la contraseña.');
      return;
    }

    setIsLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_CATALOG_API_URL || 'http://127.0.0.1:8000/api';
      // Remueve posible barra final para concatenar limpiamente
      const cleanBase = baseUrl.replace(/\/+$/, '');
      const tokenEndpoint = `${cleanBase}/token/`;

      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: trimmedUsername,
          password: password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 401) {
          setErrorMessage('Credenciales inválidas. Por favor verifique su usuario y contraseña.');
        } else if (data && (data.detail || data.non_field_errors)) {
          setErrorMessage(data.detail || (Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : 'Error de autenticación.'));
        } else {
          setErrorMessage(`Error en el servidor de autenticación (Código ${response.status}).`);
        }
        setIsLoading(false);
        return;
      }

      if (data && data.access) {
        // Guardar access y refresh token en localStorage y Cookies
        setAuthTokens(data.access, data.refresh);

        // Redirección al panel de administración (T12)
        router.push('/admin');
      } else {
        setErrorMessage('La respuesta del servidor no incluyó un token válido.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setErrorMessage('No se pudo establecer conexión con el backend (catalog-api). Verifique que esté activo.');
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.badge}>Acceso Restringido</span>
          <h1 className={styles.title}>Panel Administrativo</h1>
          <p className={styles.subtitle}>
            Inicie sesión con su cuenta de administrador para gestionar el catálogo y stock de Coupage.
          </p>
        </div>

        {errorMessage && (
          <div className={styles.errorAlert} role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="username" className={styles.label}>
              Usuario / Email
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                disabled={isLoading}
                placeholder="ej: admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Contraseña
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                disabled={isLoading}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.togglePassword}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitBtn}
          >
            {isLoading ? (
              <>
                <div className={styles.spinner}></div>
                <span>Autenticando...</span>
              </>
            ) : (
              <span>Iniciar Sesión</span>
            )}
          </button>
        </form>

        <div className={styles.footerLinks}>
          <Link href="/" className={styles.backLink}>
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}

