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

### Bloque 1: Infraestructura y Setup Base (Backend Node.js)

#### 🔹 [T14] Configuración de Firebase Cloud Firestore y Gestión de Entorno Seguro
- **Tipo:** Infraestructura / Cloud | **Prioridad:** Alta | **Estimación:** 1 SP
- **Fundamentación Teórica Prog IV:** Capítulo 4.1 (*Gestión de Entornos e Infraestructura: On-Premises vs Cloud IaaS/SaaS*) y Capítulo 4.2 (*Modelos de Base de Datos Documentales NoSQL vs Relacionales*).
- **Descripción:** Configuración del proyecto `coupage` en Google Cloud / Firebase Firestore bajo el modelo de base de datos documental multirregión. Implementación del aislamiento estricto de credenciales de la cuenta de servicio (`Service Account`), garantizando que ninguna clave privada quede expuesta en el historial de Git y permitiendo la ejecución tanto en entornos de desarrollo local como en contenedores Docker de despliegue (Render / Cloud Run).
- **Criterios de Aceptación:**
  - [x] Proyecto Firebase creado con Cloud Firestore en modo nativo activo.
  - [x] Clave privada `serviceAccountKey.json` excluida taxativamente en `.gitignore`.
  - [x] Plantilla `orders-api/.env.example` actualizada con todas las variables requeridas (`PORT`, `NODE_ENV`, `FRONTEND_URL`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`).
  - [ ] **Validación Estricta de Entorno al Arrancar (ProgIV 4.3):** El archivo `src/config/environment.js` debe verificar con un esquema o lista blanca que todas las variables existan. Si falta alguna, el proceso imprime en consola qué variable falta exactamente y termina inmediatamente con `process.exit(1)` (Fallo cerrado; el servidor jamás arranca a medias).
- **Demostración para Defensa / Tests:**
  1. Eliminar temporalmente `FIREBASE_PROJECT_ID` del archivo `.env` y ejecutar `npm start`.
  2. Verificar que el proceso imprime `[FATAL] Variable de entorno faltante: FIREBASE_PROJECT_ID` y finaliza con código de salida `1`.

#### 🔹 [T15] Conexión de Firebase Admin SDK, Probes de Salud y Apagado Ordenado (*Graceful Shutdown*)
- **Tipo:** Backend (Node.js) | **Prioridad:** Alta | **Estimación:** 2 SP | **Depende de:** T14
- **Fundamentación Teórica Prog IV:** Capítulo 3.1 (*Arquitectura del Event Loop y Ciclo de Vida del Proceso*), Capítulo 4.2 (*Singleton en Firebase Admin SDK*) y Requisito Obligatorio ProgIV 4.3.
- **Descripción:** Instanciar el cliente `firebase-admin` bajo el patrón Singleton en `src/config/firebase.js`, incorporando la normalización defensiva de saltos de línea para claves privadas en formato PEM multilínea (`.replace(/\\n/g, '\n')`). Exponer probes de orquestación desacoplados (`/health` y `/ready`) y garantizar el ciclo de vida del proceso Node.js ante señales del sistema operativo (`SIGTERM` / `SIGINT`).
- **Criterios de Aceptación:**
  - [x] Singleton `db` de Firestore exportado para desacoplamiento en adaptadores de persistencia.
  - [x] **Liveness Probe (`GET /health`):** Retorna `HTTP 200 OK` con `{ status: 'ok', uptime: process.uptime() }` indicando que el Event Loop de Node.js no está bloqueado.
  - [x] **Readiness Probe (`GET /ready`):** Ejecuta una consulta mínima de lectura a Firestore (`db.collection('orders').limit(1).get()`); retorna `HTTP 200` si la base está accesible o `HTTP 503 Service Unavailable` si Firestore está caído.
  - [ ] **Apagado Ordenado (*Graceful Shutdown* - ProgIV 4.3):** Captura de señales `SIGTERM` y `SIGINT` en `src/servidor.js`. El servidor debe dejar de aceptar peticiones nuevas (`server.close()`), permitir hasta 10 segundos para que las peticiones HTTP activas finalicen, y luego salir limpiamente con `process.exit(0)`.
  - [ ] **Manejo Defensivo Global de Excepciones:** Registrar listeners para `process.on('unhandledRejection')` y `process.on('uncaughtException')` evitando que promesas huérfanas cuelguen el proceso en silencio.
- **Demostración para Defensa / Tests:**
  ```bash
  # 1. Probar Liveness y Readiness
  curl -i http://localhost:3000/health
  curl -i http://localhost:3000/ready
  # 2. Prueba de Graceful Shutdown:
  kill -s SIGTERM $(lsof -t -i:3000)
  ```

#### 🔹 [T16] Seguridad en API: CORS Estricto, Headers de Idempotencia y Sanitización Defensiva
- **Tipo:** Backend / Seguridad | **Prioridad:** Crítica | **Estimación:** 1 SP
- **Fundamentación Teórica Prog IV:** Capítulo 6.1 (*Seguridad Web: CORS, Rate Limiting y Sanitización*) y Requisito Obligatorio ProgIV 4.6 (*Idempotencia y Prevención de Doble Posteo*).
- **Descripción:** Configurar la capa de seguridad HTTP en Express restringiendo los orígenes cruzados a la interfaz autorizada, habilitando la cabecera personalizada `Idempotency-Key` requerida por el estándar de pagos/pedidos, y sanitizando las entradas contra inyecciones NoSQL y Prototype Pollution.
- **Criterios de Aceptación:**
  - [x] Middleware `cors` configurado con lista blanca (`http://localhost:3001`, `127.0.0.1:3001` y dominios en `FRONTEND_URL`).
  - [x] Métodos `GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS` permitidos explícitamente.
  - [ ] **Habilitación de Cabeceras Seguras:** Configurar `allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'x-correlation-id']`. Las solicitudes pre-flight `OPTIONS` deben responder `HTTP 204 No Content` sin bloqueos en el navegador.
  - [ ] **Middleware de Idempotencia (ProgIV 4.6 y 5.5):** En `POST /api/orders`, si el cliente envía `Idempotency-Key: <UUID>`, el servidor guarda la respuesta en memoria/Firestore. Si el cliente reenvía exactamente la misma petición con la misma clave dentro de los 5 minutos (por ejemplo, por doble clic del usuario o microcorte de red), el backend devuelve la respuesta almacenada con `HTTP 200/201` sin crear un pedido duplicado en Firestore.
  - [ ] **Protección contra Prototype Pollution (ProgIV 1.3 y 2.1):** Rechazar cualquier payload JSON en `req.body` que contenga claves peligrosas como `__proto__`, `constructor` o `prototype`.
- **Demostración para Defensa / Tests:**
  ```bash
  curl -X OPTIONS http://localhost:3000/api/orders \
    -H "Origin: http://localhost:3001" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Idempotency-Key, Content-Type" -i
  ```

---

### Bloque 2: Lógica de Negocio, Dominio y Endpoints (Backend Node.js)

#### 🔹 [T17] Endpoint de Creación de Pedidos (`POST /api/orders`) y Snapshot de Precios del Servidor
- **Historia Padre:** HU3 (Envío de Solicitud de Pedido) | **Tipo:** Backend (Node.js) | **Estimación:** 3 SP | **Depende de:** T15, T16
- **Fundamentación Teórica Prog IV:** Capítulo 4.3 (*Arquitectura Hexagonal: Entidades y Casos de Uso*) y Requisito Obligatorio ProgIV 5.5 (*Cálculo Estricto de Precios en el Servidor*).
- **Descripción:** Construir el caso de uso `CrearPedido.js` y el endpoint `POST /api/orders` en Express. La creación debe aplicar validación de esquema exhaustiva con Joi, aplicar la regla de snapshot de precio inmutable (donde el backend calcula o valida los precios oficiales ignorando alteraciones maliciosas enviadas por el navegador), y persistir el documento en Firestore con estado inicial `PENDIENTE` y su correspondiente evento de auditoría.
- **Reglas de Negocio:**
  - Mínimo 1 producto en el carrito con cantidad $> 0$.
  - Datos de contacto obligatorios: Nombre completo, Email válido, Teléfono y Dirección o notas de entrega.
  - Snapshot de precio: guarda el precio unitario oficial y calcula el `total_amount` en el servidor.
- **Criterios de Aceptación:**
  - [x] Validación de estructura con Joi (`orderValidator.js`): datos del comprador e ítems. Ante fallas, responde `HTTP 400 Bad Request` sin procesar.
  - [ ] **Invariante de Precios Calculados en el Servidor (ProgIV 5.5):** El backend no confía ciegamente en el campo `price` o `unitPrice` del payload. Si un atacante envía `unitPrice: 0.01`, el servidor calcula el subtotal con el precio oficial registrado en catálogo y emite el `totalAmount` correcto.
  - [x] **Snapshot Inmutable:** Cada ítem se persiste con `{ productId, productName, unitPrice, quantity, subtotal }` congelando el valor exacto al momento de la orden.
  - [x] **Auditoría Inicial:** Se inicializa el array `history` con el evento `[{ status: 'PENDIENTE', timestamp: Date, note: 'Solicitud de pedido creada en checkout', author: customer.email }]`.
  - [x] **Respuesta HTTP:** Devuelve `HTTP 201 Created` con el ID único asignado por Firestore, el `orderNumber` autogenerado y el objeto completo.
- **Demostración para Defensa / Tests:**
  ```bash
  curl -X POST http://localhost:3000/api/orders -H "Content-Type: application/json" -d '{
    "customer": {"name": "Test Hacker", "email": "hacker@test.com", "phone": "1122334455", "shippingAddress": "Calle Falsa 123"},
    "items": [{"productId": 1, "saleModeId": 1, "productName": "Rutini Cabernet Malbec", "unitPrice": 0.01, "quantity": 2}]
  }'
  ```

#### 🔹 [T18] Endpoints de Listado y Transición de Estados (`GET` y `PATCH /orders`) con FSM Estricta
- **Historia Padre:** HU4 (Gestión y Trazabilidad) | **Tipo:** Backend (Node.js) | **Estimación:** 3 SP | **Depende de:** T15, T17
- **Fundamentación Teórica Prog IV:** Capítulo 5.2 (*Clases Personalizadas de Error y Transición de Estados*) y Requisito Obligatorio ProgIV 4.4 y 5.5 (*Máquina de Estados Finita y Auditoría Inmutable*).
- **Descripción:** Implementar la gestión del ciclo de vida del pedido mediante dos endpoints: `GET /api/orders` con soporte de filtrado dinámico por estado, y `PATCH /api/orders/:id/status` para transiciones de estado gobernadas por la Máquina de Estados Finita (FSM) de la entidad `Order.js`. Toda transición debe ser atómica y registrar un evento inmutable en el historial.
- **Reglas de Negocio:**
  - Transiciones válidas: `PENDIENTE` $\to$ `CONFIRMADO` $\to$ `PREPARADO` $\to$ `ENTREGADO`.
  - Cancelación: Solo permitida desde `PENDIENTE` o `CONFIRMADO` hacia `RECHAZADO` o `CANCELADO`.
  - Estados terminales: `ENTREGADO`, `RECHAZADO`, `CANCELADO` (inmutables).
  - Cualquier intento de transición inválida responde `HTTP 422 Unprocessable Entity`.
- **Criterios de Aceptación:**
  - [x] `GET /api/orders` devuelve el listado ordenado descendentemente por `createdAt`.
  - [x] Soporte para query parameter `?status=PENDIENTE`.
  - [ ] **Caso de Uso `CambiarEstadoPedido.js`:**
    1. Recupera el pedido por ID (`FirestoreOrderRepository.obtenerPorId`). Arroja `HTTP 404` si no existe.
    2. Invoca el método de dominio `order.cambiarEstado(nuevoEstado, autor, nota)`.
    3. Si la transición no está permitida, arroja `TransicionInvalidaError` que el middleware traduce a **`HTTP 422 Unprocessable Entity`**.
  - [ ] **Persistencia y Atomicidad en Firestore:** Implementar `actualizarEstado(id, nuevoEstado, eventoHistorial)` usando `FieldValue.arrayUnion()` o `runTransaction()` para evitar carreras.
  - [ ] **Middleware de Validación Joi:** Validar que el body contenga `{ status, note, author }`.
  - [ ] **Documentación OpenAPI / Swagger:** Registrar `PATCH /api/orders/{id}/status` en `orderRoutes.js`.
- **Demostración para Defensa / Tests:**
  ```bash
  # Transición legal (HTTP 200)
  curl -X PATCH http://localhost:3000/api/orders/ID_DOC/status -H "Content-Type: application/json" \
    -d '{"status": "CONFIRMADO", "note": "Stock en cava verificado", "author": "admin@coupage.com"}'
  # Transición ilegal: saltar directo a ENTREGADO sin pasar por PREPARADO (HTTP 422)
  ```

#### 🔹 [T19] Script de Datos Semilla para Pedidos de Prueba (`seed.js`)
- **Tipo:** Backend / DevOps | **Prioridad:** Media | **Estimación:** 1 SP | **Depende de:** T15
- **Fundamentación Teórica Prog IV:** Requisito Obligatorio ProgIV 4.1 (*Scripts de npm para carga de datos de prueba*).
- **Descripción:** Crear e instrumentar un script de inicialización para poblar Firestore con un lote de 5 pedidos de ejemplo distribuidos en los distintos estados (`PENDIENTE`, `CONFIRMADO`, `PREPARADO`, `ENTREGADO`, `CANCELADO`) con historiales de trazabilidad creíbles y precios representativos.
- **Criterios de Aceptación:**
  - [x] Archivo `orders-api/seed.js` implementado con lote de pedidos realistas de Coupage.
  - [x] Cada pedido incluye un historial coherente de auditoría con fechas creíbles en `history`.
  - [x] Comando `npm run seed` ejecutable desde `orders-api/` y documentado.
  - [x] Permite que cualquier desarrollador o evaluador levante el panel administrativo y vea datos reales sin ingresar compras manualmente.
- **Demostración para Defensa / Tests:**
  ```bash
  npm --prefix orders-api run seed
  ```

#### 🔹 [T20] Suite de Pruebas Automatizadas en 3 Niveles (Dominio, Integración y Concurrencia)
- **Tipo:** Backend / Testing | **Prioridad:** Alta | **Estimación:** 2 SP | **Depende de:** T17, T18
- **Fundamentación Teórica Prog IV:** Requisito Obligatorio ProgIV 4.8 (*Tests en Tres Niveles con Comando Único*) y Capítulo 5.2.
- **Descripción:** Implementar una suite de pruebas automatizadas con el runner nativo `node:test`, `node:assert/strict` y `supertest` cubriendo los 3 niveles requeridos por la cátedra en `orders-api/tests/`: Unitarios de dominio/FSM, Integración de endpoints HTTP y Seguridad/Idempotencia.
- **Criterios de Aceptación:**
  - [ ] **Nivel 1: Tests de Dominio (`tests/dominio/Order.test.js`):**
    - Rechaza carritos vacíos o cantidades $\le 0$.
    - Nace en `PENDIENTE` con evento inicial en `history`.
    - Valida transiciones permitidas y arroja `TransicionInvalidaError` ante transiciones prohibidas o sobre estados terminales.
    - Ejecución pura en memoria sin base de datos ni servidor HTTP.
  - [ ] **Nivel 2: Tests de Integración HTTP (`tests/integracion/orders.test.js`):**
    - `POST /api/orders` con datos válidos $\to$ `HTTP 201 Created`.
    - `POST /api/orders` con payload inválido $\to$ `HTTP 400 Bad Request`.
    - `GET /api/orders` $\to$ `HTTP 200 OK` con listado.
    - `GET /api/orders?status=PENDIENTE` $\to$ filtra correctamente.
    - `PATCH /api/orders/:id/status` válido $\to$ `HTTP 200 OK`.
    - `PATCH /api/orders/:id/status` inválido $\to$ `HTTP 422 Unprocessable Entity`.
  - [ ] **Nivel 3: Tests de Seguridad e Idempotencia (`tests/seguridad/orders-security.test.js`):**
    - Compra con precio manipulado (`unitPrice: 0.01`): comprueba que el servidor recalcula el total oficial.
    - Doble posteo con misma `Idempotency-Key`: comprueba que no duplica el documento en Firestore.
    - Prototype Pollution: comprueba el rechazo ante cargas que contengan `__proto__`.
  - [ ] **Comando Único de Ejecución:**
    - Configurado `"test": "node --test tests/**/*.test.js test/*.test.js"` en `orders-api/package.json` para correr con `npm test`.
- **Demostración para Defensa / Tests:**
  ```bash
  npm --prefix orders-api test
  ```

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

