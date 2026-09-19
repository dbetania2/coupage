# Coupage - Plataforma E-Commerce de Microservicios

Repositorio central del proyecto **Coupage** formado por dos microservicios independientes (`catalog-api` y `orders-api`) con persistencia políglota (**PostgreSQL** para catálogo y **Firebase** para órdenes).

---

## 🏛️ Justificación Arquitectónica (Defensa del Trabajo Práctico)

1. **Arquitectura de Microservicios Desacoplada y Persistencia Políglota:**
   - **`catalog-api` (Django REST Framework + PostgreSQL):** Microservicio encargado de la gestión del catálogo de productos y stock (Puerto `8000`), usando PostgreSQL (`coupage_db`).
   - **`orders-api` (Node.js / Express + Firebase):** Microservicio encargado del procesamiento y trazabilidad de pedidos (Puerto `3000`), utilizando Firebase como base de datos NoSQL.
   - Ambas APIs funcionan e interactúan de forma 100% independiente.

2. **Portabilidad Total e Independencia de Proveedor (Vendor Lock-in Avoidance):**
   - Cada microservicio cuenta con su propio `Dockerfile` y la infraestructura se orquesta mediante `docker-compose.yml`.
   - Garantiza que la aplicación pueda desplegarse exactamente igual en **Render**, **Railway**, **AWS**, **Google Cloud** o cualquier servidor **VPS**, sin acoplamiento a una plataforma específica.

3. **Tolerancia a Fallos (Fault Isolation):**
   - La caída o mantenimiento de uno de los microservicios no afecta la disponibilidad del otro. Cada componente corre en un proceso/contenedor aislado.

4. **Documentación Interactiva Automática (Swagger / OpenAPI):**
   - Ambas APIs cuentan con interfaces de documentación Swagger accesibles desde el navegador.

---

## 🚀 Guía de Inicio Rápido (Setup Multiplataforma: Linux y Windows)

### Prerrequisitos e Instalación de Docker

- **Node.js:** v18+ y `npm`
- **Python:** v3.11+ y `pip`
- **Docker & Docker Compose** (para la BD PostgreSQL de `catalog-api`)

#### 🐧 Instalación en Linux (Ubuntu / Debian):
```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2
# Permitir ejecutar docker sin sudo:
sudo usermod -aG docker $USER
newgrp docker
```

#### 🪟 Instalación en Windows:
Descargar e instalar **Docker Desktop** desde la web oficial:  
👉 [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)  
*(Asegurarse de tener activada la característica WSL2 durante la instalación).*

---

### Paso 1: Clonar el Repositorio e Instalar Dependencias

```bash
# 1. Clonar el repositorio
git clone https://github.com/dbetania2/coupage.git
cd coupage

# 2. Instalar el orquestador raíz (concurrently)
npm install

# 3. Instalar dependencias de orders-api (Node.js)
cd orders-api
npm install
cd ..

# 4. Activar entorno virtual (o crearlo si no existe) e instalar dependencias de catalog-api (Python/Django)
cd catalog-api
python3 -m venv venv 2>/dev/null || true
source venv/bin/activate
pip install -r requirements.txt
cd ..
```

---

### Paso 2: Crear Archivos de Variables de Entorno (`.env`)

Copia las plantillas `.env.example` en cada carpeta:

```bash
# En Linux / macOS:
cp catalog-api/.env.example catalog-api/.env
cp orders-api/.env.example orders-api/.env

# En Windows (PowerShell):
# Copy-Item catalog-api\.env.example catalog-api\.env
# Copy-Item orders-api\.env.example orders-api\.env
```

> 🔐 **Nota de Seguridad e Integración para el Equipo:**  
> Por razones de seguridad, las claves reales de producción y accesos privados de desarrollo **no se suben al repositorio de GitHub**. Una vez copiadas las plantillas `.env.example`, solicita al equipo de desarrollo por el canal privado interno el archivo de credenciales de desarrollo completas (claves de Firebase, etc.) o completa los datos necesarios en tu archivo `.env`.

---

### Paso 3: Levantar la Base de Datos PostgreSQL y Migraciones

```bash
# 1. Levantar contenedor de PostgreSQL en segundo plano
npm run db:up
# (O alternativamente: docker compose up -d)

# 2. Aplicar migraciones iniciales en catalog-api
cd catalog-api
source venv/bin/activate
python manage.py migrate

# 3. Crear el superusuario de desarrollo (Automático desde .env)
python manage.py createsuperuser --noinput
cd ..
```

* **Creación de Superusuario:**  
  *El comando `--noinput` leerá automáticamente los valores de `DJANGO_SUPERUSER_USERNAME`, `DJANGO_SUPERUSER_EMAIL` y `DJANGO_SUPERUSER_PASSWORD` configurados en tu archivo `.env` privado.*

---

### Paso 4: Ejecución en Desarrollo (Orquestada o Individual)

Dependiendo de la etapa de desarrollo en la que estés trabajando, puedes elegir cómo levantar los servicios:

#### 🟢 Opción A: Levantar AMBOS Microservicios (Recomendado para pruebas integrales)
Desde la raíz del proyecto (`/coupage`), ejecuta:

```bash
npm run dev
```
*Este comando utiliza `concurrently` para lanzar `catalog-api` (puerto 8000) y `orders-api` (puerto 3000) simultáneamente en una sola terminal.*

---

#### 🔵 Opción B: Levantar UN SOLO Microservicio (Para desarrollo enfocado)
Si solo estás trabajando en un microservicio específico, puedes levantarlo independientemente:

* **Solo Catalog API (Django):**
  ```bash
  cd catalog-api
  source venv/bin/activate
  python manage.py runserver
  ```

* **Solo Orders API (Node.js):**
  ```bash
  cd orders-api
  npm run dev
  ```

---

## 🔗 URLs del Entorno de Desarrollo y Documentación Swagger

Una vez ejecutado `npm run dev`, los servicios estarán disponibles en:

| Servicio / Componente | Base de Datos | URL Base | Documentación Swagger UI | Credenciales Dev |
| :--- | :--- | :--- | :--- | :--- |
| **Catalog API (Django)** | PostgreSQL | `http://127.0.0.1:8000/` | `http://127.0.0.1:8000/api/docs/` | Panel `/admin/` (Credenciales definidas en `.env`) |
| **Orders API (Node.js)** | Firebase | `http://127.0.0.1:3000/` | `http://127.0.0.1:3000/api-docs/` | *Público* |
| **PostgreSQL DB Local** | PostgreSQL | `127.0.0.1:5432` | N/A | Host: `127.0.0.1` \| DB: `coupage_db` \| (Credenciales definidas en `.env`) |

---

## ☁️ Despliegue en la Nube (Render)

El proyecto incluye el archivo **`render.yaml`** (Blueprint) en la raíz. Para desplegar en Render:

1. Crea una cuenta en [Render.com](https://render.com).
2. Haz clic en **New +** -> **Blueprint**.
3. Conecta este repositorio de GitHub.
4. Render creará la base de datos PostgreSQL y los dos microservicios automáticamente.
