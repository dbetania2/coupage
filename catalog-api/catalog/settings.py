"""
Django settings for catalog project.
"""
import os
import sys
from datetime import timedelta
from pathlib import Path
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Carga el archivo .env desde la raíz de catalog-api
load_dotenv(os.path.join(BASE_DIR, '.env'))

SECRET_KEY = os.getenv('SECRET_KEY')
if not SECRET_KEY:
    raise ValueError("La variable de entorno SECRET_KEY es requerida en el archivo .env.")

# Modo depuración: False en producción (Render) para ocultar trazas de error sensibles
DEBUG = os.getenv('DEBUG', 'True') == 'True'

# Seguridad: ALLOWED_HOSTS restringido (soporta Render y localhost)
raw_allowed_hosts = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1,.onrender.com')
ALLOWED_HOSTS = [h.strip() for h in raw_allowed_hosts.split(',') if h.strip()]
_render_host = os.getenv('RENDER_EXTERNAL_HOSTNAME')
if _render_host and _render_host not in ALLOWED_HOSTS and '*' not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(_render_host)
if DEBUG and '*' not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append('*')

CSRF_TRUSTED_ORIGINS = [o.strip() for o in os.getenv('CSRF_TRUSTED_ORIGINS', '').split(',') if o.strip()]
if _render_host:
    _render_origin = f'https://{_render_host}'
    if _render_origin not in CSRF_TRUSTED_ORIGINS:
        CSRF_TRUSTED_ORIGINS.append(_render_origin)

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

# Database
if 'test' in sys.argv:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
        }
    }
elif os.getenv('DB_ENGINE') == 'sqlite':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    # Selector de Entorno de Base de Datos: 'local' (por defecto) o 'render'
    db_mode = os.getenv('DB_MODE', 'local').strip().lower()

    _sslmode = os.getenv('DB_SSLMODE')
    if not _sslmode:
        _sslmode = 'disable' if (DEBUG or db_mode == 'local') else 'require'

    is_on_render = bool(os.getenv('RENDER') or os.getenv('RENDER_EXTERNAL_HOSTNAME'))

    if is_on_render or db_mode == 'render':
        # Conexión a Render (Producción o Externa)
        render_url = os.getenv('RENDER_DATABASE_URL') or os.getenv('RENDER_DB_HOST', '')
        if render_url.startswith(('postgres://', 'postgresql://')):
            from urllib.parse import urlparse, unquote
            parsed = urlparse(render_url)
            db_name = parsed.path.lstrip('/') or os.getenv('RENDER_DB_NAME', os.getenv('DB_NAME', 'coupage_db'))
            db_user = unquote(parsed.username) if parsed.username else os.getenv('RENDER_DB_USER', os.getenv('DB_USER', 'postgres'))
            db_pass = unquote(parsed.password) if parsed.password else os.getenv('RENDER_DB_PASSWORD', os.getenv('DB_PASSWORD', ''))
            db_host = parsed.hostname
            db_port = parsed.port or os.getenv('DB_PORT', '5432')
        else:
            db_name = os.getenv('DB_NAME') or os.getenv('RENDER_DB_NAME', 'coupage_db')
            db_user = os.getenv('DB_USER') or os.getenv('RENDER_DB_USER', 'postgres')
            db_pass = os.getenv('DB_PASSWORD') or os.getenv('RENDER_DB_PASSWORD', '')
            db_host = os.getenv('DB_HOST') or os.getenv('RENDER_DB_HOST', '127.0.0.1')
            db_port = os.getenv('DB_PORT') or os.getenv('RENDER_DB_PORT', '5432')

        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': db_name,
                'USER': db_user,
                'PASSWORD': db_pass,
                'HOST': db_host,
                'PORT': db_port,
                'OPTIONS': {
                    'sslmode': _sslmode,
                },
            }
        }
        if len(sys.argv) > 1 and sys.argv[1] != 'test':
            tag = "☁️  [CATALOG-API] Ejecutando en RENDER Cloud" if is_on_render else "⚠️  [CATALOG-API] ATENCIÓN: Conectado a Base de Datos RENDER"
            sys.stderr.write(f"\n{tag} ({db_host})\n\n")

    else:
        # Conexión Local (Desarrollo diario)
        db_name = os.getenv('LOCAL_DB_NAME', os.getenv('DB_NAME', 'coupage_db'))
        db_user = os.getenv('LOCAL_DB_USER', os.getenv('DB_USER', 'postgres'))
        db_pass = os.getenv('LOCAL_DB_PASSWORD', os.getenv('DB_PASSWORD', 'postgrespassword'))
        db_host = os.getenv('LOCAL_DB_HOST', os.getenv('DB_HOST', '127.0.0.1'))
        db_port = os.getenv('LOCAL_DB_PORT', os.getenv('DB_PORT', '5432'))

        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': db_name,
                'USER': db_user,
                'PASSWORD': db_pass,
                'HOST': db_host,
                'PORT': db_port,
            }
        }
        if len(sys.argv) > 1 and sys.argv[1] != 'test':
            sys.stderr.write(f"\n💻 [CATALOG-API] Usando Base de Datos: LOCAL ({db_host})\n\n")

# REST Framework & Swagger OpenAPI Configuration
REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
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

# Cabeceras de seguridad y endurecimiento en producción cuando DEBUG=False
if not DEBUG:
    # Confía en el encabezado de proxy SSL provisto por Render (evita bucles infinitos de redirección)
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    # Protección contra ataques XSS en navegadores heredados
    SECURE_BROWSER_XSS_FILTER = True
    # Previene ataques basados en confusión de tipo MIME (MIME-sniffing)
    SECURE_CONTENT_TYPE_NOSNIFF = True
    # Mitiga Clickjacking impidiendo que la API sea embebida en iframes
    X_FRAME_OPTIONS = 'DENY'
    # Redirección obligatoria a HTTPS en producción (configurable por variable de entorno)
    SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'True') == 'True'
    # Garantiza que cookies de sesión y CSRF sólo se transmitan por canales cifrados (HTTPS)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

