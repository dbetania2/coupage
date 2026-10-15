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

### 🔹 [T02] Desarrollo de Serializadores y Endpoints REST de Consulta (Catalog API)
- **Issue en GitHub:** [#9](https://github.com/dbetania2/coupage/issues/9)
- **Rama:** `feature/T02-category-endpoints`
- **Estado:** ✅ Completado al 100% (4 pruebas unitarias pasando, Swagger validado)
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
