import { isValidSessionId } from '../../db/FirestoreAiSessionRepository.js';

const MAX_MESSAGE_LENGTH = 600;

export class AiController {
  constructor({ asistenteService, sessionRepository }) {
    this.asistenteService = asistenteService;
    this.sessionRepository = sessionRepository;
  }

  obtenerEstado = async (req, res, next) => {
    try {
      const status = await this.asistenteService.obtenerEstado();
      return res.status(200).json(status);
    } catch (error) {
      next(error);
    }
  };

  listarSesiones = async (req, res, next) => {
    try {
      const sessions = await this.sessionRepository.listarSesiones(20);
      return res.status(200).json(sessions);
    } catch (error) {
      next(error);
    }
  };

  obtenerSesion = async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!isValidSessionId(id)) {
        return res.status(400).json({
          error: 'ValidacionError',
          message: 'Identificador de sesión inválido.',
        });
      }

      const session = await this.sessionRepository.obtenerPorId(id);
      if (!session) {
        return res.status(404).json({
          error: 'SesionNoEncontrada',
          message: 'La sesión solicitada no existe.',
        });
      }
      return res.status(200).json(session);
    } catch (error) {
      next(error);
    }
  };

  eliminarSesion = async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!isValidSessionId(id)) {
        return res.status(400).json({
          error: 'ValidacionError',
          message: 'Identificador de sesión inválido.',
        });
      }

      await this.sessionRepository.eliminarSesion(id);
      return res.status(200).json({ deleted: true, id });
    } catch (error) {
      next(error);
    }
  };

  chat = async (req, res, next) => {
    try {
      const { message, sessionId, stream } = req.body || {};
      if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({
          error: 'ValidacionError',
          message: 'El mensaje de consulta es obligatorio.',
        });
      }

      if (message.trim().length > MAX_MESSAGE_LENGTH) {
        return res.status(400).json({
          error: 'ValidacionError',
          message: `La consulta no puede superar los ${MAX_MESSAGE_LENGTH} caracteres.`,
        });
      }

      if (sessionId !== undefined && sessionId !== null && !isValidSessionId(sessionId)) {
        return res.status(400).json({
          error: 'ValidacionError',
          message: 'Identificador de sesión inválido.',
        });
      }

      const result = await this.asistenteService.procesarConsulta({
        message,
        sessionId: sessionId || null,
      });

      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        res.write(
          `event: meta\ndata: ${JSON.stringify({
            sessionId: result.sessionId,
            sessionTitle: result.sessionTitle,
            toolTraces: result.toolTraces,
            usage: result.usage,
            guardrailTriggered: result.guardrailTriggered,
          })}\n\n`
        );

        const chunks = result.reply.match(/.{1,48}(\s|$)|\S+/g) || [result.reply];
        for (const chunk of chunks) {
          res.write(`event: delta\ndata: ${JSON.stringify({ text: chunk })}\n\n`);
        }

        res.write(`event: done\ndata: ${JSON.stringify({ done: true })}\n\n`);
        return res.end();
      }

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
