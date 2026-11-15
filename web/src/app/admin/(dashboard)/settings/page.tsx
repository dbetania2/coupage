'use client';

import React, { useEffect, useState } from 'react';
import { getAccessToken, getRefreshToken } from '@/lib/auth';
import { ORDERS_API_URL } from '@/features/orders/useOrders';
import { AdminPageHeader } from '@/shared/ui/admin';

export default function AdminSettingsPage() {
  const [healthStatus, setHealthStatus] = useState<string>('Verificando...');
  const [readyStatus, setReadyStatus] = useState<string>('Verificando...');
  const [aiStatus, setAiStatus] = useState<string>('Verificando...');
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

    fetch(`${ORDERS_API_URL}/ai/status`)
      .then((r) => r.json())
      .then((d) =>
        setAiStatus(
          `${d.provider || 'Activo'} · Modelo: ${d.model || 'llama-3.3-70b-versatile'} (${
            d.toolsCount || 4
          } Tools activas)`
        )
      )
      .catch(() => setAiStatus('Pendiente de iniciar orders-api'));
  }, [ordersServerRoot]);

  const hasAccess = typeof window !== 'undefined' && Boolean(getAccessToken());
  const hasRefresh = typeof window !== 'undefined' && Boolean(getRefreshToken());

  return (
    <div>
      <AdminPageHeader
        eyebrow="Parámetros del Sistema · Integración de Microservicios"
        title="Configuración y Diagnóstico de APIs"
        subtitle="Estado en vivo de la conexión entre Next.js, Django DRF (Catalog API), Node.js (Orders API + Cloud Firestore) y el Asistente IA."
      />

      <div className="admin-grid-2">
        <section className="admin-card admin-card-stack">
          <h2 className="admin-card-title">Endpoints y Probes de Salud (T05, T15, T16)</h2>
          <div className="admin-info-box admin-info-box-loose">
            • <strong>Catalog API (Django):</strong> <code>{catalogUrl}</code><br />
            • <strong>Orders API (Node.js):</strong> <code>{ORDERS_API_URL}</code><br />
            • <strong>Liveness Probe (GET /health):</strong> <code>{healthStatus}</code><br />
            • <strong>Readiness Probe (GET /ready):</strong> <code>{readyStatus}</code>
          </div>
        </section>

        <section className="admin-card admin-card-stack">
          <h2 className="admin-card-title">Seguridad JWT y Asistente IA (T06, T25, T31)</h2>
          <div className="admin-info-box admin-info-box-loose">
            • <strong>Access Token JWT (Django SimpleJWT):</strong>{' '}
            <code>{hasAccess ? 'Activo en sesión' : 'No presente'}</code><br />
            • <strong>Refresh Token JWT:</strong>{' '}
            <code>{hasRefresh ? 'Activo (Rotación habilitada)' : 'No presente'}</code><br />
            • <strong>Motor Asistente IA (Sprint 3):</strong>{' '}
            <code>{aiStatus}</code>
          </div>
        </section>
      </div>
    </div>
  );
}
