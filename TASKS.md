# 📋 Tablero de Tareas Asignadas - @satinamatias
**Proyecto:** Coupage (`dbetania2/coupage`)  
**Sprint:** Sprint 1  

---

## 🚀 Tareas Pendientes (Abiertas)

### 🔹 [T12] Estructura visual (Layout) del Dashboard Privado
- **Issue en GitHub:** [#19](https://github.com/dbetania2/coupage/issues/19)
- **Tipo:** Tarea Técnica / Frontend | **Prioridad:** Media | **Estimación:** 2 SP
- **Ubicación:** `web/src/` (Next.js)
- **Descripción:** Construcción de la estructura visual base para el panel de administración en Next.js. Incluye Sidebar/Navbar y protección de rutas con JWT.
- **Criterios de Aceptación:**
  - [ ] Creación de `AdminLayout` en Next.js (`web/src/app/admin/layout.tsx`).
  - [ ] Menú lateral (Sidebar) o Navbar superior para navegación administrativa.
  - [ ] Rutas protegidas: si un usuario no logueado intenta entrar a `/admin/*`, redirigir al Login (T11).
  - [ ] Botón de Logout (eliminar token y redirigir a inicio o login).

---

### 🔹 [T13] Formularios de ABM de Productos (Alta, baja y modificación)
- **Issue en GitHub:** [#20](https://github.com/dbetania2/coupage/issues/20)
- **Tipo:** Tarea Técnica / Frontend | **Prioridad:** Alta | **Estimación:** 5 SP
- **Ubicación:** `web/src/` (Next.js)
- **Descripción:** Desarrollo de las interfaces para el alta, baja y modificación de productos en el panel de administración. Incluye la grilla de productos y los formularios conectados a los endpoints protegidos inyectando JWT.
- **Criterios de Aceptación:**
  - [ ] Definir estrategia de almacenamiento para imágenes de productos (Media local/Cloudinary).
  - [ ] Tabla (Data Grid) mostrando la lista completa de productos.
  - [ ] Formulario modal o página separada para Crear Producto (POST) con carga de imagen.
  - [ ] Formulario para Editar Producto (PUT/PATCH).
  - [ ] Botón para cambiar estado (Alta/Baja Lógica).
  - [ ] Peticiones fetch/axios inyectando `Authorization: Bearer <token>` en el header.

---

## ✅ Tareas Completadas (Cerradas / Listas para PR)

### 🔹 [T11] Pantalla de Login de Administrador
- **Issue en GitHub:** [#18](https://github.com/dbetania2/coupage/issues/18)
- **Tipo:** Tarea Técnica / Frontend | **Prioridad:** Alta | **Estimación:** 2 SP
- **Estado:** ✅ Completado
- **Ubicación:** `web/src/app/admin/login/`, `web/src/lib/auth.ts`
- **Criterios de Aceptación:**
  - [x] Formulario con campos Username y Password.
  - [x] Petición POST al endpoint de Token de Django (`/api/token/`).
  - [x] Guardado seguro del `access_token` y `refresh` en `localStorage` y en Cookies sincronizadas.
  - [x] Redirección automática al Dashboard (`/admin`) tras autenticarse con éxito.
  - [x] Mostrar mensajes de error de autenticación (Ej: Credenciales inválidas o fallas de conexión).

---

### 🔹 [T06] Autenticación JWT en Django (Proteger escritura)
- **Issue en GitHub:** [#13](https://github.com/dbetania2/coupage/issues/13)
- **Tipo:** Tarea Técnica / Backend | **Prioridad:** Alta | **Estimación:** 3 SP
- **Estado:** ✅ Completado
- **Ubicación:** `catalog-api/catalog/settings.py`, `catalog-api/catalog/urls.py`, `catalog-api/products/views.py`
- **Criterios de Aceptación:**
  - [x] Instalar y configurar `djangorestframework-simplejwt` en `requirements.txt` y `settings.py`.
  - [x] Crear endpoints `/api/token/` y `/api/token/refresh/`.
  - [x] Aplicar permisos `IsAdminUser` a los métodos POST, PUT, PATCH, DELETE en `ProductViewSet` y `CategoryViewSet`, manteniendo lectura pública (GET) con `AllowAny`.
  - [x] Cobertura de pruebas unitarias para generación de tokens, denegación no autorizada (401), usuario regular (403) y creación por administrador (201).

---

### 🔹 [T05] Configuración de CORS en Django
- **Issue en GitHub:** [#12](https://github.com/dbetania2/coupage/issues/12)
- **Tipo:** Tarea Técnica / Backend | **Prioridad:** Crítica | **Estimación:** 1 SP
- **Estado:** ✅ Completado
- **Ubicación:** `catalog-api/catalog/settings.py`, `catalog-api/requirements.txt`
- **Criterios de Aceptación:**
  - [x] Instalar la dependencia `django-cors-headers`.
  - [x] Añadir a `INSTALLED_APPS` y al `MIDDLEWARE` en `settings.py`.
  - [x] Configurar `CORS_ALLOWED_ORIGINS` (incluyendo `http://localhost:3000` y `http://127.0.0.1:3000`).
  - [x] Habilitar `CORS_ALLOW_CREDENTIALS = True` para envío seguro de cabeceras de autorización.

---

### 🔹 [T04] Pruebas Unitarias e Integración para Endpoints del Catálogo
- **Issue en GitHub:** [#11](https://github.com/dbetania2/coupage/issues/11)
- **Tipo:** Tarea Técnica / QA & Testing | **Prioridad:** Media | **Estimación:** 1 SP
- **Estado:** ✅ Completado
- **Ubicación:** `catalog-api/products/tests.py`
- **Criterios de Aceptación:**
  - [x] Tests en `products/tests.py` validados con `python manage.py test`.
  - [x] Prueba de listado de catálogo completo respondiendo `HTTP 200 OK`.
  - [x] Prueba de filtrado por categoría existente retornando únicamente los productos correspondientes.
  - [x] Prueba de consulta con categoría inexistente manejando correctamente la respuesta HTTP (retorna 200 OK con lista vacía).

---

### 🔹 [T02] Desarrollo de Serializadores y Endpoints REST de Consulta (Catalog API)
- **Issue en GitHub:** [#9](https://github.com/dbetania2/coupage/issues/9)
- **Rama:** `feature/T02-category-endpoints`
- **Estado:** ✅ Completado al 100% (pruebas unitarias pasando, Swagger validado)
- **Criterios de Aceptación:**
  - [x] Serializadores `CategorySerializer` y `ProductSerializer` creados con DRF (`products/serializers.py`).
  - [x] Endpoint `GET /api/categories/` que retorna las categorías activas (`is_active=True`).
  - [x] Endpoint `GET /api/products/` que retorna la lista de productos.
  - [x] Filtrado por categoría activo mediante query parameter (ej. `GET /api/products/?category=vinos`).
  - [x] Documentar endpoint de categorías en Swagger UI (`/api/docs/`).
  - [x] Frontend `FilterSidebar.tsx` actualizado para consumir dinámicamente `/api/categories/`.

---
- [x] **[T00]** [#7](https://github.com/dbetania2/coupage/issues/7) Configuración del Entorno de Desarrollo y Estructura Base.
- [x] **[T03]** [#10](https://github.com/dbetania2/coupage/issues/10) Carga de Datos Iniciales y Fixtures del Catálogo (Seed Data).
