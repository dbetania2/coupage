'use client';

import React, { useEffect, useState } from 'react';
import { getAccessToken, getRefreshToken } from '@/lib/auth';
import { ORDERS_API_URL } from '@/features/orders/useOrders';

export default function AdminSettingsPage() {
  const [healthStatus, setHealthStatus] = useState<string>('Verificando...');
  const [readyStatus, setReadyStatus] = useState<string>('Verificando...');
  const catalogUrl = process.env.NEXT_PUBLIC_CATALOG_API_URL || 'http://127.0.0.1:8000/api';
  const ordersServerRoot = ORDERS_API_URL.replace(/\/api$/, '');

  useEffect(() => {
    fetch(`${ordersServerRoot}/health`)
      .then((r) => r.json())
      .then((d) => setHealthStatus(`OK (${d.status || 'UP'})`))
      .catch(() => setHealthStatus('Desconectado (Verificar puerto 3000)'));

    fetch(`${ordersServerRoot}/ready`)
      .then((r) => r.json())
      .then((d) => setReadyStatus(`OK (${d.status || 'READY'} - Firestore conectado)`))
      .catch(() => setReadyStatus('No disponible'));
  }, [ordersServerRoot]);

  const hasAccess = typeof window !== 'undefined' && Boolean(getAccessToken());
  const hasRefresh = typeof window !== 'undefined' && Boolean(getRefreshToken());

  return (
    <div>
      <header style={{ marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Parámetros del Sistema · Integración de Microservicios
        </span>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem', fontFamily: 'Inter, sans-serif' }}>
          Configuración y Diagnóstico de APIs
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Estado en vivo de la conexión entre Next.js, Django DRF (Catalog API) y Node.js (Orders API + Cloud Firestore).
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <section style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
            Endpoints y Probes de Salud (T05, T15, T16)
          </h2>
          <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc', fontSize: '0.84rem', lineHeight: 1.8 }}>
            • <strong>Catalog API (Django):</strong> <code>{catalogUrl}</code><br />
            • <strong>Orders API (Node.js):</strong> <code>{ORDERS_API_URL}</code><br />
            • <strong>Liveness Probe (GET /health):</strong> <code>{healthStatus}</code><br />
            • <strong>Readiness Probe (GET /ready):</strong> <code>{readyStatus}</code>
          </div>
        </section>

        <section style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
            Seguridad JWT y Asistente IA (T06, T25, T31)
          </h2>
          <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc', fontSize: '0.84rem', lineHeight: 1.8 }}>
            • <strong>Access Token JWT (Django SimpleJWT):</strong>{' '}
            <code>{hasAccess ? 'Activo en sesión' : 'No presente'}</code><br />
            • <strong>Refresh Token JWT:</strong>{' '}
            <code>{hasRefresh ? 'Activo (Rotación habilitada)' : 'No presente'}</code><br />
            • <strong>Modelo IA (Sprint 3 - T31):</strong>{' '}
            <code>[Aquí irá estado de conexión con Claude API y Tool Calling en POST /api/ai/chat]</code>
          </div>
        </section>
      </div>
    </div>
  );
}
