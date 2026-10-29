# Coupage Web — Arquitectura Frontend

Frontend público y panel administrativo de **Tu Gusto Gourmet**, construido con **Next.js (App Router) + React + TypeScript**.

Este documento define la arquitectura de carpetas, el patrón de diseño de componentes, el sistema de estilos y las convenciones que todo el equipo debe respetar al trabajar en `web/`.

---

## 1. Ejecución

Desde la **raíz del monorepo** (`coupage/`), sin necesidad de entrar a `web/`:

```bash
npm run db:up     # 1° Base de datos (requerida por catalog-api)
npm run dev       # 2° Catalog API + Orders API + Web
npm run dev:web   # (alternativa) Solo la web
```

- Web: `http://localhost:3001`
- La URL del backend se define en `web/.env.local` → `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api`

---

## 2. Decisiones de Arquitectura (Resumen)

| Aspecto | Decisión |
| :--- | :--- |
| Framework | Next.js App Router |
| Arquitectura de carpetas | **Feature-Based** con capas `core` / `shared` / `features` |
| Separación de layouts | **Route Groups** de Next.js: `(public)` y `(admin)` |
| Patrón de componentes | **Atomic Design simplificado** (3 niveles: `ui` → `layout`/`features` → `app`) |
| Estilos | **CSS Modules** + **Design Tokens** en variables CSS nativas |
| Nomenclatura CSS | camelCase dentro de CSS Modules (no se usa BEM: el scope ya lo aísla) |
| Tipografías | `next/font` (Playfair Display + Inter) |
| Renderizado | Server Components por defecto; `'use client'` solo donde haya interactividad |

---

## 3. Estructura de Carpetas

```
web/
├── public/                         ← Archivos estáticos servidos tal cual
│   ├── images/
│   │   ├── brand/                  ← logo.svg, logo-dark.svg, isotipo.svg
│   │   ├── banners/                ← hero, promociones
│   │   └── placeholders/           ← imagen por defecto de producto
│   └── icons/                      ← íconos de redes sociales, etc.
│
└── src/
    ├── app/                        ← SOLO ruteo (pages y layouts)
    │   ├── layout.tsx              ← Raíz: <html>, <body>, fuentes, estilos globales
    │   ├── (public)/
    │   │   ├── layout.tsx          ← Header + <main> + Footer
    │   │   ├── page.tsx            ← Catálogo  →  /
    │   │   └── product/[id]/
    │   │       └── page.tsx        ← Detalle  →  /product/:id
    │   └── (admin)/
    │       └── admin/
    │           ├── layout.tsx      ← AdminSidebar (sin Header/Footer público)
    │           ├── page.tsx        → /admin
    │           ├── login/          → /admin/login
    │           └── products/       → /admin/products
    │
    ├── core/                       ← Infraestructura global, SIN componentes visuales
    │   ├── config/
    │   │   └── env.ts              ← Lectura centralizada de variables de entorno
    │   ├── api/
    │   │   └── client.ts           ← Cliente HTTP base (fetch) hacia las APIs
    │   └── auth/
    │       └── auth.ts             ← Manejo de token / sesión
    │
    ├── shared/                     ← Reutilizable por cualquier feature
    │   ├── ui/                     ← Átomos: Button, Input, Badge, Logo, Container
    │   │   └── Button/
    │   │       ├── Button.tsx
    │   │       ├── Button.module.css
    │   │       └── index.ts
    │   ├── layout/                 ← Estructura global persistente
    │   │   ├── Header/
    │   │   │   ├── Header.tsx
    │   │   │   ├── NavLinks.tsx    ← 'use client' (link activo / menú mobile)
    │   │   │   ├── Header.module.css
    │   │   │   └── index.ts
    │   │   └── Footer/
    │   │       ├── Footer.tsx
    │   │       ├── Footer.module.css
    │   │       └── index.ts
    │   ├── hooks/                  ← Hooks genéricos (useMediaQuery, useDebounce)
    │   ├── utils/                  ← Funciones puras (formatPrice, etc.)
    │   └── styles/
    │       ├── tokens.css          ← Design Tokens (colores, tipografía, espaciado)
    │       ├── reset.css           ← Reset base
    │       └── globals.css         ← Importa tokens + reset y estilos del <body>
    │
    └── features/                   ← Un módulo por dominio de negocio (Historia de Usuario)
        ├── catalog/                ← HU1: Consulta y filtrado del catálogo
        │   ├── components/         ← ProductCard, ProductGrid, FilterSidebar
        │   ├── services/           ← getProducts(), getProductById()
        │   ├── hooks/              ← useProducts(), useFilters()
        │   └── types.ts            ← Product, Category, Filters
        ├── orders/                 ← HU de pedidos (orders-api)
        └── admin/                  ← Gestión administrativa
            └── components/         ← AdminSidebar, tablas, formularios
```

### Responsabilidad de cada capa

| Capa | Qué contiene | Qué NO contiene |
| :--- | :--- | :--- |
| `app/` | Rutas, layouts, metadata, composición de features | Lógica de negocio, llamadas HTTP directas, estilos complejos |
| `core/` | Configuración, cliente HTTP, autenticación | Componentes visuales |
| `shared/` | UI genérica, layout global, hooks y utils reutilizables | Nada específico de un dominio (ej. nada que sepa qué es un "vino") |
| `features/` | Componentes, servicios, hooks y tipos de un dominio | Imports de otra feature |

### Reglas de dependencia (obligatorias)

- `app/` → puede importar de `features/`, `shared/` y `core/`.
- `features/` → puede importar de `shared/` y `core/`. **Nunca de otra feature.**
- `shared/` → puede importar de `core/`. **Nunca de `features/`.**
- `core/` → no importa de ninguna otra capa.

Si dos features necesitan lo mismo, ese código se **sube a `shared/`**.

### Route Groups `(public)` y `(admin)`

Las carpetas entre paréntesis **no forman parte de la URL**. Permiten que cada zona tenga su propio layout:

- Todo lo que esté dentro de `(public)/` recibe automáticamente Header y Footer.
- Todo lo que esté dentro de `(admin)/` recibe el Sidebar administrativo.
- Header y Footer **no deben** usar `usePathname()` para ocultarse en el admin; la separación la hace el ruteo.

---

## 4. Patrón de Diseño de Componentes: Atomic Design Simplificado

Se adopta una versión reducida de Atomic Design en tres niveles, para evitar discusiones innecesarias sobre "molécula vs organismo":

| Nivel | Ubicación | Descripción | Ejemplos |
| :--- | :--- | :--- | :--- |
| **Átomos** | `shared/ui/` | Piezas mínimas, sin lógica de negocio, 100% reutilizables y controladas por props | `Button`, `Input`, `Badge`, `Logo`, `Container` |
| **Organismos** | `shared/layout/` y `features/*/components/` | Combinan átomos para resolver una sección concreta | `Header`, `Footer`, `ProductCard`, `FilterSidebar` |
| **Páginas** | `app/` | Componen organismos y obtienen los datos | `(public)/page.tsx` |

### Convenciones de componentes

- **Un componente por carpeta**, con su `.tsx`, su `.module.css` y un `index.ts` que lo reexporta:
  ```ts
  // shared/ui/Button/index.ts
  export { default } from './Button';
  ```
- Nombres de componentes y carpetas en **PascalCase** (`ProductCard/`).
- Hooks en **camelCase** con prefijo `use` (`useProducts.ts`).
- Servicios y utils en **camelCase** (`getProducts.ts`, `formatPrice.ts`).
- Imports siempre con alias `@/` (ej. `import Button from '@/shared/ui/Button'`), nunca rutas relativas largas (`../../../`).
- Las keys en listas deben ser **IDs estables** (`product.id`), nunca el índice del array.

### Server vs Client Components

- Por defecto todo componente es **Server Component** (no envía JS al navegador).
- Se agrega `'use client'` **solo** cuando el componente usa estado, efectos, eventos o APIs del navegador.
- Se aísla la parte interactiva en el componente más pequeño posible. Ejemplo: `Header` es Server Component y solo `NavLinks` (menú mobile) es Client Component.

---

## 5. Sistema de Estilos y Tema Global

### Estrategia

- **CSS Modules** (`Componente.module.css`) para el estilo de cada componente. El nombre de clase queda aislado automáticamente, por lo que **no se utiliza BEM**.
- **Design Tokens** como variables CSS en `shared/styles/tokens.css`. Ningún componente debe tener colores, tamaños de fuente ni espaciados escritos "a mano": siempre se usan los tokens.
- `globals.css` solo contiene: import de tokens, reset y estilos base de `body`. **No** estilos de componentes.

### Tokens de "Tu Gusto Gourmet"

```css
/* shared/styles/tokens.css */
:root {
  /* Colores */
  --color-bg: #0a0a0a;
  --color-bg-card: #141414;
  --color-bg-input: #1a1a1a;
  --color-text-primary: #ffffff;
  --color-text-secondary: #9e9e9e;
  --color-accent: #d4af37;
  --color-accent-hover: #b5952f;
  --color-border: #2a2a2a;

  /* Tipografía (las variables las inyecta next/font) */
  --font-heading: var(--font-playfair), serif;
  --font-body: var(--font-inter), sans-serif;

  --text-xs: 0.75rem;   /* 12px */
  --text-sm: 0.875rem;  /* 14px */
  --text-base: 1rem;    /* 16px */
  --text-lg: 1.25rem;   /* 20px */
  --text-xl: 1.5rem;    /* 24px */
  --text-2xl: 2rem;     /* 32px */
  --text-3xl: 3rem;     /* 48px */

  /* Espaciado — Sistema de 8 puntos */
  --space-1: 0.5rem;    /* 8px  */
  --space-2: 1rem;      /* 16px */
  --space-3: 1.5rem;    /* 24px */
  --space-4: 2rem;      /* 32px */
  --space-6: 3rem;      /* 48px */
  --space-8: 4rem;      /* 64px */

  /* Layout */
  --container-max: 1440px;
  --header-height: 4rem;
  --radius-sm: 4px;
  --radius-md: 8px;
}
```

### Tipografías

Se cargan con `next/font/google` en `app/layout.tsx` (no con `@import` en CSS), lo que evita bloqueos de renderizado y descargas externas en tiempo de ejecución.

### Responsive — Mobile First

Los estilos base se escriben para mobile y se amplían con `min-width`:

| Breakpoint | Rango | Grilla |
| :--- | :--- | :--- |
| Mobile | `< 768px` | 4 columnas, márgenes 16px |
| Tablet | `≥ 768px` | 8 columnas |
| Desktop | `≥ 1024px` | 12 columnas, márgenes 24–32px |
| Large Desktop | `≥ 1440px` | Contenedor con `max-width: var(--container-max)` |

- **CSS Grid** para la estructura de página (layout general, grilla de productos, columnas del footer).
- **Flexbox** para alinear elementos internos (navbar, tarjetas, formularios).
- Unidades: `rem` para tipografía y espaciado; `%`, `vw`/`vh` para estructuras fluidas. Evitar anchos fijos en `px` sobre contenedores de texto.

---

## 6. Accesibilidad y Criterios de UX

### Accesibilidad (WCAG 2.1 AA)

- HTML semántico: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`.
- Contraste mínimo 4.5:1 en texto normal y 3:1 en texto grande.
- Todo elemento interactivo debe tener estilo `:focus-visible`.
- El color nunca es la única forma de transmitir información (acompañar con texto o ícono).
- Toda imagen informativa lleva `alt` descriptivo; las decorativas, `alt=""`.

### Leyes de UX aplicadas

- **Jakob:** logo arriba a la izquierda que lleva a `/`; carrito arriba a la derecha.
- **Hick:** navegación principal con un máximo de 5 a 7 links.
- **Fitts:** botones y links táctiles de al menos 44×44px.
- **Gestalt (proximidad):** el footer agrupa la información en bloques: Redes, Contacto y Legales.

---

## 7. Layout Global (T07)

### Header (`shared/layout/Header`)

- Logo (enlace a `/`).
- Links principales de navegación.
- Acceso a carrito.
- Menú hamburguesa en mobile (en `NavLinks.tsx`, único Client Component).

### Footer (`shared/layout/Footer`)

- Bloque **Redes**: íconos con enlace a redes sociales.
- Bloque **Contacto**: email, teléfono, dirección.
- Bloque **Legales**: términos y condiciones, política de privacidad, aviso de consumo responsable de alcohol.
- Server Component (sin JavaScript en el cliente).
- 1 columna en mobile, 3 columnas desde desktop.

### Aplicación

El layout se aplica en `app/(public)/layout.tsx`. Toda página nueva de la vista pública debe crearse dentro de `(public)/` para heredar Header y Footer automáticamente.

---

## 8. Imágenes y Archivos Estáticos

### Dónde van

| Tipo de imagen | Ubicación | Uso en código |
| :--- | :--- | :--- |
| Logo e identidad de marca | `public/images/brand/` | `src="/images/brand/logo.svg"` |
| Banners / hero | `public/images/banners/` | `src="/images/banners/hero.webp"` |
| Placeholder de producto | `public/images/placeholders/` | `src="/images/placeholders/product.webp"` |
| Íconos de redes / UI | `public/icons/` | `src="/icons/instagram.svg"` |
| Favicon | `src/app/favicon.ico` | Next.js lo detecta automáticamente |
| Fotos de productos | **No van en el repositorio** | Las sirve `catalog-api` (URL que llega en la respuesta de la API) |

- Todo lo que está en `public/` se sirve desde la raíz del sitio: `public/images/brand/logo.svg` → `/images/brand/logo.svg`. **No** se escribe `public` en la ruta.
- Las imágenes de productos son **datos**, no assets: las administra el backend y nunca se suben a `web/public/`.

### Cómo se usan

Siempre con el componente `next/image` (optimización, lazy loading y prevención de saltos de layout):

```tsx
import Image from 'next/image';

<Image
  src="/images/brand/logo.svg"
  alt="Tu Gusto Gourmet"
  width={160}
  height={40}
  priority   // solo para el logo/hero visibles al cargar
/>
```

Para imágenes remotas (servidas por `catalog-api`), el dominio debe declararse en `next.config.ts` mediante `images.remotePatterns`.

### Formatos y convenciones

- **SVG** para logos e íconos (escalan sin perder calidad).
- **WebP** para fotografías y banners.
- Nombres en **kebab-case**, sin espacios ni tildes: `logo-dark.svg`, `hero-vinos.webp`.
- Optimizar el peso antes de subir (idealmente < 200 KB por imagen).

---

## 9. Checklist para Agregar Código Nuevo

- [ ] ¿Es una ruta? → `app/(public)/` o `app/(admin)/admin/`.
- [ ] ¿Es específico de un dominio (catálogo, pedidos, admin)? → `features/<dominio>/`.
- [ ] ¿Lo usan dos o más features? → `shared/`.
- [ ] ¿Es configuración, cliente HTTP o auth? → `core/`.
- [ ] ¿Usé tokens en lugar de valores fijos de color, fuente y espaciado?
- [ ] ¿Usé `'use client'` solo si era imprescindible?
- [ ] ¿Las imágenes usan `next/image` y tienen `alt`?
- [ ] ¿El componente es navegable con teclado y tiene `:focus-visible`?
