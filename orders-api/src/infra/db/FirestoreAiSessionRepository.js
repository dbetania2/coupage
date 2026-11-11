const VALID_SESSION_ID_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

export function isValidSessionId(sessionId) {
  return typeof sessionId === 'string' && VALID_SESSION_ID_REGEX.test(sessionId);
}

export class FirestoreAiSessionRepository {
  constructor(db) {
    this.collection = db.collection('ai_sessions');
  }

  async listarSesiones(limit = 15) {
    const safeLimit = Math.min(Math.max(1, Number(limit) || 15), 50);
    const snapshot = await this.collection.limit(safeLimit).get();
    const sesiones = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      sesiones.push({
        id: doc.id,
        title: data.title || 'Consulta operativa',
        messagesCount: Array.isArray(data.messages) ? data.messages.length : 0,
        totalTokens: data.totalTokens || 0,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    return sesiones.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  }

  async obtenerPorId(sessionId) {
    if (!isValidSessionId(sessionId)) return null;
    const doc = await this.collection.doc(sessionId).get();
    if (!doc.exists) return null;
    return {
      id: doc.id,
      ...doc.data(),
    };
  }

  async guardarInteraccion({ sessionId, title, userMessage, assistantMessage, toolTraces, tokensUsed }) {
    const now = new Date().toISOString();

    if (isValidSessionId(sessionId)) {
      const docRef = this.collection.doc(sessionId);
      const doc = await docRef.get();
      if (doc.exists) {
        const current = doc.data();
        const messages = Array.isArray(current.messages) ? [...current.messages] : [];
        messages.push(
          {
            role: 'user',
            content: userMessage,
            timestamp: now,
          },
          {
            role: 'assistant',
            content: assistantMessage,
            toolTraces: toolTraces || [],
            tokensUsed: tokensUsed || 0,
            timestamp: now,
          }
        );

        const updatedData = {
          title: current.title || title || userMessage.slice(0, 48),
          messages,
          totalTokens: (current.totalTokens || 0) + (tokensUsed || 0),
          updatedAt: now,
        };

        await docRef.set(updatedData, { merge: true });
        return {
          id: doc.id,
          ...current,
          ...updatedData,
        };
      }
    }

    const initialMessages = [
      {
        role: 'user',
        content: userMessage,
        timestamp: now,
      },
      {
        role: 'assistant',
        content: assistantMessage,
        toolTraces: toolTraces || [],
        tokensUsed: tokensUsed || 0,
        timestamp: now,
      },
    ];

    const newSession = {
      title: title || userMessage.slice(0, 48),
      messages: initialMessages,
      totalTokens: tokensUsed || 0,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await this.collection.add(newSession);
    return {
      id: docRef.id,
      ...newSession,
    };
  }

  async eliminarSesion(sessionId) {
    if (!isValidSessionId(sessionId)) return false;
    await this.collection.doc(sessionId).delete();
    return true;
  }
}
