"""
Django settings for catalog project.
"""
import os
import sys
from datetime import timedelta
from pathlib import Path
from dotenv import load_dotenv
from .db_config import get_database_config

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Carga el archivo .env desde la raíz de catalog-api
load_dotenv(os.path.join(BASE_DIR, '.env'))

SECRET_KEY = os.getenv('SECRET_KEY')
if not SECRET_KEY:
    raise ValueError("La variable de entorno SECRET_KEY es requerida en el archivo .env.")

# Modo depuración: False en producción (Render) para ocultar trazas de error sensibles
DEBUG = os.getenv('DEBUG', 'True') == 'True'

# Seguridad de Red: ALLOWED_HOSTS y CSRF_TRUSTED_ORIGINS
# ALLOWED_HOSTS previene ataques de 'HTTP Host header injection', asegurando que
# Django solo responda a peticiones dirigidas a sus dominios reconocidos.
ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1,.onrender.com').split(',')
    if host.strip()
]

# CSRF_TRUSTED_ORIGINS: dominios confiables para peticiones HTTP con estado
CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in os.getenv('CSRF_TRUSTED_ORIGINS', '').split(',')
    if origin.strip()
]

# Compatibilidad con Render: Render inyecta RENDER_EXTERNAL_HOSTNAME en tiempo de ejecución.
# Lo agregamos automáticamente a hosts y orígenes seguros sin requerir tocar el archivo .env.
# TODO: Hacer el código 100% agnóstico al proveedor eliminando este bloque y definiendo
# los dominios directamente en ALLOWED_HOSTS y CSRF_TRUSTED_ORIGINS desde el .env del servidor.
RENDER_EXTERNAL_HOSTNAME = os.getenv('RENDER_EXTERNAL_HOSTNAME')
if RENDER_EXTERNAL_HOSTNAME:
    if RENDER_EXTERNAL_HOSTNAME not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)
    render_origin = f'https://{RENDER_EXTERNAL_HOSTNAME}'
    if render_origin not in CSRF_TRUSTED_ORIGINS:
        CSRF_TRUSTED_ORIGINS.append(render_origin)

# En desarrollo local (DEBUG=True) permitimos comodín para facilitar pruebas y contenedores
if DEBUG and '*' not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append('*')

# Control de exposición: permite encender/apagar Swagger en Render desde variables de entorno
ENABLE_SWAGGER = os.getenv('ENABLE_SWAGGER', 'True') == 'True'

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'django_filters',
    'corsheaders',
    'drf_spectacular',
    'products',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'catalog.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'catalog.wsgi.application'

# Database (Configuración delegada en catalog/db_config.py: SQLite en test, PostgreSQL en Local/Render)
DATABASES = get_database_config(BASE_DIR, DEBUG)

# REST Framework & Swagger OpenAPI Configuration
REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'products.pagination.PaginacionEstandar',
    'PAGE_SIZE': 10,
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_THROTTLE_CLASSES': (
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
        'rest_framework.throttling.ScopedRateThrottle',
    ),
    'DEFAULT_THROTTLE_RATES': {
        'anon': '120/minute',
        'user': '300/minute',
        'login': '10/minute',
    },
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Catalog API - Coupage',
    'DESCRIPTION': 'Microservicio de Gestión de Catálogo de Productos para Coupage',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'es-es'
TIME_ZONE = 'America/Argentina/Buenos_Aires'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedStaticFilesStorage',
    },
}

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Orígenes permitidos para CORS:
# En producción solo acepta orígenes explícitos configurados vía variable de entorno.
# Los puertos localhost solo se habilitan automáticamente en desarrollo local (DEBUG=True).
raw_cors_origins = os.getenv('CORS_ALLOWED_ORIGINS')

if raw_cors_origins:
    if raw_cors_origins.strip().lower() in ('true', '1', '*', 'all'):
        # Si se especificó comodín abierto
        CORS_ALLOW_ALL_ORIGINS = True
        CORS_ALLOWED_ORIGINS = []
    else:
        # En producción estricta: solo URLs válidas con https:// (o http://)
        CORS_ALLOWED_ORIGINS = [
            origin.strip() for origin in raw_cors_origins.split(',')
            if origin.strip().startswith(('http://', 'https://'))
        ]
else:
    # Entorno local de desarrollo por defecto (nunca expone localhost si DEBUG=False)
    CORS_ALLOWED_ORIGINS = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3001',
    ] if DEBUG else []

CORS_ALLOW_CREDENTIALS = True

# Reglas de seguridad para el servidor en la nube (cuando DEBUG=False)
if not DEBUG:
    # Le avisa a Django que el servidor de la nube ya usa HTTPS y evita errores de redirección
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    # Bloquea código malicioso inyectado desde el navegador
    SECURE_BROWSER_XSS_FILTER = True
    # Evita que disfracen archivos peligrosos como si fueran imágenes
    SECURE_CONTENT_TYPE_NOSNIFF = True
    # Impide que otra página web incruste nuestra aplicación para engañar al usuario
    X_FRAME_OPTIONS = 'DENY'
    # Obliga a que todas las conexiones sean seguras con HTTPS
    SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'True') == 'True'
    # Envía las cookies únicamente a través de conexiones seguras y cifradas
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

