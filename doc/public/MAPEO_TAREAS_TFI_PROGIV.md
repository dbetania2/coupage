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

## 🟢 FASE 2: TFI - Sprint 2 (Pedidos y Trazabilidad - Firebase)

_Estado: Planificado para ejecución inmediata. Foco en flujo de checkout sin cobro automático (solicitud de cotización/pedido) y trazabilidad completa del ciclo de vida del pedido._

### 📌 Reglas de Negocio Centrales del Sprint 2
1. **Intención de Compra (Sin Pasarela de Pago Inmediata):** El cliente envía una solicitud de pedido formal. El sistema no descuenta stock en tiempo real ni cobra tarjeta automáticamente; registra la intención para verificación física en cava/bodega.
2. **Máquina de Estados Finita Estricta:**
   $$\text{PENDIENTE} \longrightarrow \text{CONFIRMADO} \longrightarrow \text{PREPARADO} \longrightarrow \text{ENTREGADO}$$
   *Transición de descarte:* Un pedido en estado `PENDIENTE` o `CONFIRMADO` puede pasar a `RECHAZADO` o `CANCELADO`. Un pedido `ENTREGADO` o `RECHAZADO` es un estado terminal (inmutable).
3. **Auditoría Obligatoria e Inmutable:** Todo documento de pedido en Firestore contiene una lista `history` donde cada cambio de estado añade un evento `{ status, timestamp, author, note }`. No se sobrescriben datos históricos.
4. **Captura Histórica de Precios:** Los pedidos almacenan el precio unitario exacto del producto al momento de enviar la solicitud (`snapshot_price`), evitando que futuras actualizaciones en el catálogo modifiquen pedidos pasados.

---

### Bloque 1: Infraestructura y Setup Base

#### 🔹 [T14] Creación y Configuración del Proyecto Firebase en Cloud
- **Tipo:** Infraestructura / Cloud | **Prioridad:** Alta | **Estimación:** 1 SP
- **Descripción:** Crear el proyecto `coupage` en la consola de Firebase, habilitar la base de datos Cloud Firestore en la región multirregión adecuada, generar la clave privada de Service Account (`serviceAccountKey.json`) y configurar la plantilla de entorno.
- **Criterios de Aceptación:**
  - [ ] Proyecto Firebase creado y Cloud Firestore activo con reglas de seguridad iniciales.
  - [ ] Clave privada de Service Account generada y resguardada (sin commitear al repo).
  - [ ] `.gitignore` verificado para ignorar `*serviceAccountKey*.json` y credenciales.
  - [ ] `orders-api/.env.example` actualizado con `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` y `FIREBASE_PRIVATE_KEY`.

#### 🔹 [T15] Conexión e Inicialización del SDK de Firebase en `orders-api`
- **Tipo:** Backend (Node.js) | **Prioridad:** Alta | **Estimación:** 2 SP | **Depende de:** T14
- **Descripción:** Integrar el SDK oficial `firebase-admin` en Node.js, crear el módulo `orders-api/config/firebase.js` que lea las variables de entorno de forma segura (normalizando saltos de línea de la clave privada) y exponer un endpoint `/health` de diagnóstico.
- **Criterios de Aceptación:**
  - [ ] Paquete `firebase-admin` instalado en `orders-api/package.json`.
  - [ ] Conexión singleton exportando la instancia de Firestore (`db`).
  - [ ] Endpoint `GET /health` responde `HTTP 200` confirmando conexión activa con Firestore.

#### 🔹 [T16] Configuración de CORS y Seguridad en `orders-api`
- **Tipo:** Backend / Seguridad | **Prioridad:** Crítica | **Estimación:** 1 SP
- **Descripción:** Configurar el middleware `cors` en Express restringido al origen de la aplicación web (`http://localhost:3001` y dominios de despliegue), permitiendo métodos `GET`, `POST`, `PATCH`, `OPTIONS` y encabezados de autorización.
- **Criterios de Aceptación:**
  - [ ] Peticiones desde el frontend en puerto 3001 no sufren bloqueos de Cross-Origin.
  - [ ] Headers `Content-Type` y `Authorization` habilitados explícitamente.

---

### Bloque 2: Lógica de Negocio y Endpoints (Backend Node.js)

#### 🔹 [T17] Endpoint de Creación de Solicitudes de Pedido (`POST /orders`)
- **Historia Padre:** HU3 (Envío de Solicitud de Pedido) | **Tipo:** Backend | **Estimación:** 3 SP | **Depende de:** T15
- **Descripción:** Desarrollar el endpoint `POST /api/orders` en Express con validación de esquema con Joi. Guarda el documento en la colección `orders` de Firestore con estado inicial `PENDIENTE` y estructura de snapshot.
- **Reglas de Negocio:**
  - Mínimo 1 producto en el carrito con cantidad $> 0$.
  - Datos de contacto obligatorios: Nombre completo, Email válido, Teléfono y Dirección o notas de entrega.
  - Snapshot de precio: guarda el precio unitario y calcula el `total_amount` en el servidor.
- **Criterios de Aceptación:**
  - [ ] Valida el cuerpo de la petición con Joi arrojando `HTTP 400 Bad Request` ante datos inválidos.
  - [ ] Crea el documento en Firestore asignando ID único, estado inicial `PENDIENTE` y evento inicial en `history`.
  - [ ] Responde `HTTP 201 Created` con el ID de pedido generado y esquema documentado en Swagger UI.

#### 🔹 [T18] Endpoints de Listado y Transición de Estados (`GET` y `PATCH /orders`)
- **Historia Padre:** HU4 (Gestión y Trazabilidad) | **Tipo:** Backend | **Estimación:** 3 SP | **Depende de:** T15
- **Descripción:** Crear `GET /api/orders` para listar todas las solicitudes ordenadas cronológicamente con soporte de filtros por estado, y `PATCH /api/orders/:id/status` para ejecutar transiciones de estado controladas.
- **Reglas de Negocio:**
  - Transiciones válidas: `PENDIENTE` $\to$ `CONFIRMADO` $\to$ `PREPARADO` $\to$ `ENTREGADO`.
  - Cancelación: Solo permitida desde `PENDIENTE` o `CONFIRMADO` hacia `RECHAZADO` o `CANCELADO`.
  - Cualquier intento de transición inválida (ej. `ENTREGADO` $\to$ `PENDIENTE`) responde `HTTP 422 Unprocessable Entity`.
- **Criterios de Aceptación:**
  - [ ] `GET /api/orders` devuelve el listado ordenado descendentemente por `createdAt`.
  - [ ] Soporte para query parameter `?status=PENDIENTE`.
  - [ ] `PATCH /api/orders/:id/status` actualiza el estado y añade un registro atómico al array `history`.

#### 🔹 [T19] Script de Datos Semilla para Pedidos de Prueba (`seed_orders.js`)
- **Tipo:** Backend / DevOps | **Prioridad:** Media | **Estimación:** 1 SP | **Depende de:** T15
- **Descripción:** Crear un script de inicialización para poblar Firestore con un lote de 6 pedidos de ejemplo distribuidos en los distintos estados (`PENDIENTE`, `CONFIRMADO`, `PREPARADO`, `ENTREGADO`, `RECHAZADO`) con historiales de trazabilidad creíbles.
- **Criterios de Aceptación:**
  - [ ] Comando `npm run seed:orders` ejecutable desde `orders-api/` o la raíz.
  - [ ] Permite que cualquier desarrollador levante el panel administrativo y vea datos reales sin ingresar compras manualmente.

#### 🔹 [T20] Pruebas Unitarias y de Integración en `orders-api`
- **Tipo:** Backend / Testing | **Prioridad:** Media | **Estimación:** 2 SP | **Depende de:** T17, T18
- **Descripción:** Implementar suite de pruebas automatizadas con Jest y Supertest cubriendo los flujos críticos de la API de pedidos.
- **Criterios de Aceptación:**
  - [ ] Test de creación exitosa de pedido (`POST /orders` $\to$ 201).
  - [ ] Test de validación fallida por carrito vacío o email inválido (`POST /orders` $\to$ 400).
  - [ ] Test de máquina de estados: valida transición permitida (200) y transición prohibida (422).
  - [ ] Comando `npm test` configurado en `orders-api/package.json`.

---

### Bloque 3: Interfaz Pública y Carrito de Compras (Frontend Next.js)

#### 🔹 [T21] Carrito de Compras Global con Persistencia Local (Next.js)
- **Historia Padre:** HU3 (Envío de Solicitud de Pedido) | **Tipo:** Frontend | **Estimación:** 3 SP
- **Descripción:** Implementar el estado global del carrito de compras en la web mediante Context API o Zustand, sincronizado con `localStorage` para persistir la selección del usuario.
- **Reglas de Negocio:**
  - Si se añade un producto ya existente, incrementa su cantidad en lugar de duplicar la fila.
  - La cantidad mínima de un ítem en el carrito es 1; reducir a 0 elimina el producto.
  - Cálculo dinámico de subtotales y total general en tiempo real.
- **Criterios de Aceptación:**
  - [ ] Contador numérico en el `SiteHeader` refleja la cantidad total de artículos.
  - [ ] Métodos disponibles: `addItem`, `removeItem`, `updateQuantity`, `clearCart`.
  - [ ] Los productos no se pierden al recargar el navegador ni al navegar entre páginas.

#### 🔹 [T22] Drawer Lateral del Carrito y Formulario de Solicitud de Pedido
- **Historia Padre:** HU3 (Envío de Solicitud de Pedido) | **Tipo:** Frontend | **Estimación:** 3 SP | **Depende de:** T17, T21
- **Descripción:** Desarrollar el Drawer lateral que se despliega al presionar el ícono de carrito en el Header, mostrando la lista de compras, selector de cantidades, desglose de precios y formulario de contacto.
- **Criterios de Aceptación:**
  - [ ] Animación fluida de apertura/cierre lateral con fondo desenfocado (backdrop).
  - [ ] Formulario con campos: Nombre y Apellido, Correo Electrónico, Teléfono y Notas de entrega.
  - [ ] Botón de acción "Confirmar Solicitud de Pedido" con estado de carga (spinner).
  - [ ] Conexión directa con `POST /api/orders` y pantalla modal de confirmación con el código de seguimiento.

---

### Bloque 4: Panel Administrativo y Trazabilidad (Frontend Next.js)

#### 🔹 [T23] Vista de Gestión de Pedidos en Dashboard (`/admin/orders`)
- **Historia Padre:** HU4 (Gestión y Trazabilidad) | **Tipo:** Frontend | **Estimación:** 3 SP | **Depende de:** T18
- **Descripción:** Crear la página `/admin/orders` dentro del layout protegido `(dashboard)` conectada a `orders-api`, mostrando la tabla de pedidos recibidos con filtros por estado y selector de cambio rápido.
- **Criterios de Aceptación:**
  - [ ] Tabla con columnas: ID de Pedido, Fecha, Cliente, Total estimado y Estado con badge coloreado.
  - [ ] Filtro rápido mediante pestañas o selector (Todos, Pendientes, Confirmados, Entregados, etc.).
  - [ ] Selector o botón de acción directa para transicionar de estado con confirmación visual (toast de éxito).

#### 🔹 [T24] Modal de Detalle de Pedido y Línea de Tiempo de Auditoría
- **Historia Padre:** HU4 (Gestión y Trazabilidad) | **Tipo:** Frontend | **Estimación:** 2 SP | **Depende de:** T18, T23
- **Descripción:** Componente modal para abrir el detalle completo de un pedido desde la tabla administrativa, visualizando los productos solicitados y la línea de tiempo vertical (*timeline*) de trazabilidad histórica.
- **Criterios de Aceptación:**
  - [ ] Muestra datos del cliente, dirección/notas y desglose de ítems con sus precios congelados.
  - [ ] Componente visual de línea de tiempo que renderiza cada evento del array `history` con fecha, hora, estado y autor del cambio.

---

## 🟢 FASE 3: TFI - Sprint 3 (Asistente de IA)

_Estado: Planificado para después del Sprint 2. (Estimación: 13 SP)_

### Backend (Node.js) - Motor de IA
- [ ] **T25:** Configuración Base y Prompt Engineering (Setup SDK y System Prompt).
- [ ] **T26:** Persistencia de Sesiones de Chat (Guardar historial en BD).
- [ ] **T27:** Desarrollo de Tools de Catálogo (Lectura de stock y productos).
- [ ] **T28:** Desarrollo de Tools de Pedidos (Consultas de estados y filtrado).
- [ ] **T29:** Motor de Despacho (Dispatcher) y Manejo de Errores / Fallbacks.
- [ ] **T30:** Implementación de Server-Sent Events (Streaming de respuestas).
- [ ] **T31:** Rate Limiting y Control de Costos (Tokens).

### Frontend (Next.js) - Experiencia de Usuario
- [ ] **T32:** Componente de Chat con soporte de Streaming.
- [ ] **T33:** Renderizado de Markdown y Tablas Dinámicas.
- [ ] **T34:** UI de Sugerencias y Gestión de Historial (Limpiar chat, Prompts rápidos).

### Seguridad y Testing
- [ ] **T35:** Enmascaramiento de Datos Sensibles (PII) en Tools.
- [ ] **T36:** Pruebas de Inyección y Grounding (Evitar alucinaciones y salidas de rol).

