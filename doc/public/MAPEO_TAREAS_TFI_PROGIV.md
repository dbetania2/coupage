# Planificación Estratégica de Tareas: TFI vs Programación IV

Este documento desglosa todas las tareas técnicas (Tickets `Txx`) del proyecto, separando claramente qué se debe construir **AHORA** para aprobar el Trabajo Final Integrador (TFI), y qué se postergará para **DESPUÉS** (las últimas dos semanas) para cumplir con las exigencias complejas de la materia Programación IV.

---

## 🟢 FASE 1: TFI - Sprint 1 (Catálogo y Gestión de Productos)

_Estado: En curso. El objetivo es tener el catálogo público y el panel administrativo funcional._

### Backend (Django) - _Completado en su mayoría_

- [x] **T01:** Modelos de base de datos (`Product`, `Category` con slug).
- [x] **T02:** Endpoints públicos (Catalog API).
- [x] **T03:** Script de datos semilla (`seed.py`).
- [ ] **T04:** Pruebas unitarias de la API de catálogo.
- [ ] **T05:** Configuración de CORS en Django.
- [ ] **T06:** Autenticación JWT en Django (Proteger escritura).

### Frontend (Next.js) - _Por hacer AHORA_

- [ ] **T07:** Layout Global y Navegación Pública (Header & Footer). _(Incluye definir arq. de carpetas, patrón de diseño UI e integrar CSS)._
- [ ] **T08:** Diseño de la Landing Page (Inicio).
- [ ] **T09:** Maquetación del Catálogo Público (Grilla y Tarjetas).
- [ ] **T10:** Sistema de Filtros por Categoría dinámico.
- [ ] **T11:** Pantalla de Login de Administrador.
- [ ] **T12:** Estructura visual (Layout) del Dashboard Privado.
- [ ] **T13:** Formularios de ABM de Productos (Alta, baja y modificación). _(Incluye definir estrategia de almacenamiento de imágenes)._

---

## 🟢 FASE 2: TFI - Sprint 2 (Pedidos y Trazabilidad)

_Estado: Pendiente. Se utilizará Firebase como indica el plan del TFI para avanzar rápido._

> **⚠️ DECISIÓN ARQUITECTÓNICA PENDIENTE:** Se evaluará más adelante si mantener Firebase para esta fase al profe le daba igual si usabamos firebase

### Backend (Node.js) & Frontend

- [ ] **T12:** Configuración de entorno Node.js y conexión a Firebase Firestore.
- [ ] **T13:** Endpoints básicos en Node (Orders API) para recibir solicitudes (POST).
- [ ] **T14:** Desarrollo del Carrito de Compras y formulario de contacto (Next.js).
- [ ] **T15:** Tabla de gestión de pedidos en el Dashboard Admin con cambio de estados.
- [ ] **T16:** Historial y auditoría visual de los cambios de estado del pedido.

---

## 🟢 FASE 3: TFI - Sprint 3 (Asistente de IA)

_Estado: Pendiente. (Estimación: 13 SP)_

### Backend (Node.js) - Motor de IA

- [ ] **TXX:** Configuración Base y Prompt Engineering (Setup SDK y System Prompt).
- [ ] **TXX:** Persistencia de Sesiones de Chat (Guardar historial en BD).
- [ ] **TXX:** Desarrollo de Tools de Catálogo (Lectura de stock y productos).
- [ ] **TXX:** Desarrollo de Tools de Pedidos (Consultas de estados y filtrado).
- [ ] **TXX:** Motor de Despacho (Dispatcher) y Manejo de Errores / Fallbacks.
- [ ] **TXX:** Implementación de Server-Sent Events (Streaming de respuestas).
- [ ] **TXX:** Rate Limiting y Control de Costos (Tokens).

### Frontend (Next.js) - Experiencia de Usuario

- [ ] **TXX:** Componente de Chat con soporte de Streaming.
- [ ] **TXX:** Renderizado de Markdown y Tablas Dinámicas.
- [ ] **TXX:** UI de Sugerencias y Gestión de Historial (Limpiar chat, Prompts rápidos).

### Seguridad y Testing

- [ ] **TXX:** Enmascaramiento de Datos Sensibles (PII) en Tools.
- [ ] **TXX:** Pruebas de Inyección y Grounding (Evitar alucinaciones y salidas de rol).

---

---

## 🔴 FASE 4: Adaptación a Programación IV (Las últimas 2 semanas)

_Estado: POSTERGADO. Estas tareas son exclusivamente para aprobar la materia ProgIV. Modificarán profundamente lo construido en la Fase 2._

### Cambios Arquitectónicos (Requisitos Obligatorios ProgIV)

- [ ] **T23 (ProgIV): Migración a PostgreSQL.** Mover toda la base de datos de Pedidos de Firebase a PostgreSQL (ProgIV no permite NoSQL como DB principal). Evaluar mas adelante.
- [ ] **T24 (ProgIV): Arquitectura Hexagonal.** Refactorizar la API de Node.js separando estrictamente el Dominio, los Casos de Uso y los Adaptadores. _(Nota: Opcional, pero hay que buscar alguna arquitectura)._
- [ ] **T25 (ProgIV): Ampliación de Modelos.** Agregar lógica de Variantes (Talles/Colores) y Depósitos (requerido por el Grupo 5 de ProgIV). _(Nota: Es posible adelantar la implementación de estos modelos a la Fase 1 en Django para ahorrar tiempo de rediseño más adelante, a discreción del equipo)._

### Concurrencia y Lógica Dura

- [ ] **T26 (ProgIV): Reserva Temporal.** Crear máquina de estados donde iniciar un carrito bloquea el stock, y si vence el tiempo, se libera automáticamente.
- [ ] **T27 (ProgIV): Carrera de Stock.** Implementar transacciones (bloqueos explícitos SQL) para evitar que dos clientes compren el mismo producto simultáneamente.
- [ ] **T28 (ProgIV): Idempotencia y Webhooks.** Implementar adaptador de pagos externo simulado, asegurando que un doble intento no cobre dos veces.

### Mediciones y Testing Severo

- [ ] **T29 (ProgIV): Tarea Pesada (Streams).** Desarrollar la exportación masiva de movimientos de stock sin colapsar la memoria de Node.js.
- [ ] **T30 (ProgIV): Tests Unitarios y de Integración en Node.js.** Cubrir concurrencia y fallos.
- [ ] **T31 (ProgIV): Informe de Latencia y Event Loop.** Realizar pruebas de carga (Autocannon) midiendo p50, p95 y p99.
- [ ] **T32 (ProgIV): Registros ADR.** Redactar los documentos de decisiones de arquitectura.
