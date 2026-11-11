'use client';

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { getAccessToken } from '@/lib/auth';
import { ORDERS_API_URL } from '@/features/orders/useOrders';

export interface AiToolTrace {
  toolName: string;
  source: string;
  durationMs: number;
  args: Record<string, unknown>;
  summary: string;
}

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
  toolTraces?: AiToolTrace[];
  tokensUsed?: number;
  timestamp: string;
}

export interface AiSessionSummary {
  id: string;
  title: string;
  messagesCount: number;
  totalTokens: number;
  createdAt: string;
  updatedAt: string;
}

export interface AiToolSpec {
  id: string;
  name: string;
  moduleOrigin: string;
  description: string;
  paramsSpec: string;
  samplePrompt: string;
}

export interface AiEngineStatus {
  status: 'connected' | 'fallback_local';
  provider: string;
  model: string;
  apiKeyConfigured: boolean;
  toolsCount: number;
  tools: string[];
  toolSpecs?: AiToolSpec[];
  sanitizedOrderSample?: Record<string, unknown> | null;
  rateLimit?: {
    usedInWindow: number;
    maxPerMinute: number;
    remainingInWindow: number;
    windowSeconds: number;
  };
  quota: {
    usedTokens: number;
    limitTokens: number;
    percentage: number;
  };
}

export interface MarkdownTableBlock {
  type: 'table';
  headers: string[];
  rows: string[][];
}

export interface MarkdownTextBlock {
  type: 'text';
  text: string;
}

export type MarkdownBlock = MarkdownTableBlock | MarkdownTextBlock;

/**
 * Parsea texto Markdown separando bloques de texto y tablas estructuradas.
 */
export function parseMarkdownBlocks(content: string): MarkdownBlock[] {
  if (!content) return [];
  const lines = content.split('\n');
  const blocks: MarkdownBlock[] = [];
  let currentTextLines: string[] = [];
  let i = 0;

  const flushText = () => {
    const joined = currentTextLines.join('\n').trim();
    if (joined) {
      blocks.push({ type: 'text', text: joined });
    }
    currentTextLines = [];
  };

  while (i < lines.length) {
    const line = lines[i].trim();
    const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';

    // Detectar inicio de tabla Markdown: línea con | seguida de línea separadora |---|
    if (
      line.startsWith('|') &&
      line.endsWith('|') &&
      nextLine.startsWith('|') &&
      nextLine.includes('-')
    ) {
      flushText();
      const headers = line
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());
      i += 2; // Saltar cabecera y fila separadora
      const rows: string[][] = [];

      while (i < lines.length) {
        const rowLine = lines[i].trim();
        if (!rowLine.startsWith('|') || !rowLine.endsWith('|')) break;
        const cells = rowLine
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());
        rows.push(cells);
        i++;
      }

      if (headers.length > 0 && rows.length > 0) {
        blocks.push({ type: 'table', headers, rows });
      }
      continue;
    }

    currentTextLines.push(lines[i]);
    i++;
  }

  flushText();
  return blocks;
}

function useAiAssistantStore() {
  const [engineStatus, setEngineStatus] = useState<AiEngineStatus | null>(null);
  const [sessions, setSessions] = useState<AiSessionSummary[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [lastToolTraces, setLastToolTraces] = useState<AiToolTrace[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getHeaders = useCallback(() => {
    const token = getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }, []);

  const refreshMetadata = useCallback(async () => {
    try {
      const headers = getHeaders();
      const [statusRes, sessRes] = await Promise.all([
        fetch(`${ORDERS_API_URL}/ai/status`, { headers }),
        fetch(`${ORDERS_API_URL}/ai/sessions`, { headers }),
      ]);

      if (statusRes.ok) {
        const stData: AiEngineStatus = await statusRes.json();
        setEngineStatus(stData);
      }
      if (sessRes.ok) {
        const sessList: AiSessionSummary[] = await sessRes.json();
        setSessions(Array.isArray(sessList) ? sessList : []);
      }
    } catch {
      // Silencioso si orders-api no está corriendo aún
    }
  }, [getHeaders]);

  useEffect(() => {
    let cancelled = false;
    const headers = getHeaders();

    Promise.all([
      fetch(`${ORDERS_API_URL}/ai/status`, { headers }).then((r) => (r.ok ? r.json() : null)),
      fetch(`${ORDERS_API_URL}/ai/sessions`, { headers }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(async ([stData, sessList]) => {
        if (cancelled) return;
        if (stData) setEngineStatus(stData);
        if (Array.isArray(sessList)) {
          setSessions(sessList);
          if (sessList.length > 0) {
            const firstId = sessList[0].id;
            setActiveSessionId(firstId);
            const detailRes = await fetch(`${ORDERS_API_URL}/ai/sessions/${firstId}`, { headers });
            if (!cancelled && detailRes.ok) {
              const detail = await detailRes.json();
              const msgs: AiChatMessage[] = Array.isArray(detail.messages) ? detail.messages : [];
              setMessages(msgs);
              const lastAssistant = [...msgs].reverse().find((m) => m.role === 'assistant');
              setLastToolTraces(lastAssistant?.toolTraces || []);
            }
          }
        }
      })
      .catch(() => {
        // Silencioso si orders-api está apagado
      });

    return () => {
      cancelled = true;
    };
  }, [getHeaders]);

  const selectSession = useCallback(
    async (sessionId: string) => {
      setActiveSessionId(sessionId);
      setError(null);
      try {
        const res = await fetch(`${ORDERS_API_URL}/ai/sessions/${sessionId}`, {
          headers: getHeaders(),
        });
        if (res.ok) {
          const detail = await res.json();
          const msgs: AiChatMessage[] = Array.isArray(detail.messages) ? detail.messages : [];
          setMessages(msgs);
          const lastAssistant = [...msgs].reverse().find((m) => m.role === 'assistant');
          setLastToolTraces(lastAssistant?.toolTraces || []);
        }
      } catch {
        setError('No se pudo cargar la sesión seleccionada desde Firestore.');
      }
    },
    [getHeaders]
  );

  const startNewSession = useCallback(() => {
    setActiveSessionId(null);
    setMessages([]);
    setLastToolTraces([]);
    setError(null);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || loading) return;

      setLoading(true);
      setError(null);

      const optimisticUserMsg: AiChatMessage = {
        role: 'user',
        content: clean,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticUserMsg]);

      try {
        const res = await fetch(`${ORDERS_API_URL}/ai/chat`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            message: clean,
            sessionId: activeSessionId,
          }),
        });

        const data = await res.json().catch(() => null);
        if (!res.ok || !data) {
          throw new Error(data?.message || `Error HTTP ${res.status}`);
        }

        const assistantMsg: AiChatMessage = {
          role: 'assistant',
          content: data.reply || '',
          toolTraces: data.toolTraces || [],
          tokensUsed: data.usage?.totalTokens || 0,
          timestamp: new Date().toISOString(),
        };

        setActiveSessionId(data.sessionId || activeSessionId);
        setMessages((prev) => [...prev, assistantMsg]);
        setLastToolTraces(data.toolTraces || []);
        await refreshMetadata();
      } catch (err) {
        setError(
          err instanceof Error
            ? `No se pudo procesar la consulta en orders-api: ${err.message}`
            : 'Error de conexión con el motor de IA en orders-api (puerto 3000).'
        );
      } finally {
        setLoading(false);
      }
    },
    [activeSessionId, getHeaders, loading, refreshMetadata]
  );

  const deleteSession = useCallback(
    async (sessionId?: string | null) => {
      const targetId = sessionId || activeSessionId;
      if (!targetId) {
        startNewSession();
        return;
      }
      try {
        await fetch(`${ORDERS_API_URL}/ai/sessions/${targetId}`, {
          method: 'DELETE',
          headers: getHeaders(),
        });
        startNewSession();
        await refreshMetadata();
      } catch {
        setError('No se pudo eliminar la sesión en Firestore.');
      }
    },
    [activeSessionId, getHeaders, refreshMetadata, startNewSession]
  );

  return {
    engineStatus,
    sessions,
    activeSessionId,
    messages,
    lastToolTraces,
    loading,
    error,
    sendMessage,
    selectSession,
    startNewSession,
    deleteSession,
    refreshMetadata,
  };
}

type AiAssistantContextValue = ReturnType<typeof useAiAssistantStore>;

const AiAssistantContext = createContext<AiAssistantContextValue | null>(null);

export function AiAssistantProvider({ children }: { children: React.ReactNode }) {
  const store = useAiAssistantStore();
  return React.createElement(AiAssistantContext.Provider, { value: store }, children);
}

export function useAiAssistant(): AiAssistantContextValue {
  const ctx = useContext(AiAssistantContext);
  if (!ctx) {
    throw new Error('useAiAssistant debe utilizarse dentro de AiAssistantProvider');
  }
  return ctx;
}

