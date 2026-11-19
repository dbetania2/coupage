"""
Módulo de configuración dinámica de Base de Datos para catalog-api.
Separa la lógica de conexión (Testing en memoria, PostgreSQL Local y PostgreSQL Render)
para mantener catalog/settings.py limpio y declarativo.
"""

import os
import sys
from pathlib import Path
from urllib.parse import unquote, urlparse


def get_database_config(base_dir: Path, debug: bool) -> dict[str, dict[str, object]]:
    """
    Retorna el diccionario DATABASES de Django según el entorno de ejecución:
    1. Modo Test ('test' in sys.argv): SQLite en memoria RAM (:memory:) para velocidad y aislamiento.
    2. Modo Render (DB_MODE=render o entorno Render Cloud): PostgreSQL remoto con SSL.
    3. Modo Local (DB_MODE=local): Contenedor PostgreSQL local de desarrollo.
    """
    if "test" in sys.argv:
        return {
            "default": {
                "ENGINE": "django.db.backends.sqlite3",
                "NAME": ":memory:",
            }
        }

    if os.getenv("DB_ENGINE") == "sqlite":
        return {
            "default": {
                "ENGINE": "django.db.backends.sqlite3",
                "NAME": base_dir / "db.sqlite3",
            }
        }

    db_mode = os.getenv("DB_MODE", "local").strip().lower()
    is_on_render = bool(os.getenv("RENDER") or os.getenv("RENDER_EXTERNAL_HOSTNAME"))

    sslmode = os.getenv("DB_SSLMODE")
    if not sslmode:
        sslmode = "require" if (is_on_render or db_mode == "render" or not debug) else "disable"

    if is_on_render or db_mode == "render":
        render_url = os.getenv("RENDER_DATABASE_URL") or os.getenv("RENDER_DB_HOST", "")
        if render_url.startswith(("postgres://", "postgresql://")):
            parsed = urlparse(render_url)
            db_name = parsed.path.lstrip("/") or os.getenv(
                "RENDER_DB_NAME", os.getenv("DB_NAME", "coupage_db")
            )
            db_user = (
                unquote(parsed.username)
                if parsed.username
                else os.getenv("RENDER_DB_USER", os.getenv("DB_USER", "postgres"))
            )
            db_pass = (
                unquote(parsed.password)
                if parsed.password
                else os.getenv("RENDER_DB_PASSWORD", os.getenv("DB_PASSWORD", ""))
            )
            db_host = parsed.hostname
            db_port = parsed.port or os.getenv("DB_PORT", "5432")
        else:
            db_name = os.getenv("DB_NAME") or os.getenv("RENDER_DB_NAME", "coupage_db")
            db_user = os.getenv("DB_USER") or os.getenv("RENDER_DB_USER", "postgres")
            db_pass = os.getenv("DB_PASSWORD") or os.getenv("RENDER_DB_PASSWORD", "")
            db_host = os.getenv("DB_HOST") or os.getenv("RENDER_DB_HOST", "127.0.0.1")
            db_port = os.getenv("DB_PORT") or os.getenv("RENDER_DB_PORT", "5432")

        if len(sys.argv) > 1 and sys.argv[1] != "test":
            tag = (
                "☁️  [CATALOG-API] Ejecutando en RENDER Cloud"
                if is_on_render
                else "⚠️  [CATALOG-API] ATENCIÓN: Conectado a Base de Datos RENDER"
            )
            sys.stderr.write(f"\n{tag} ({db_host})\n\n")

        return {
            "default": {
                "ENGINE": "django.db.backends.postgresql",
                "NAME": db_name,
                "USER": db_user,
                "PASSWORD": db_pass,
                "HOST": db_host,
                "PORT": db_port,
                "OPTIONS": {
                    "sslmode": sslmode,
                },
            }
        }

    # Conexión Local (Desarrollo diario)
    db_name = os.getenv("LOCAL_DB_NAME", os.getenv("DB_NAME", "coupage_db"))
    db_user = os.getenv("LOCAL_DB_USER", os.getenv("DB_USER", "postgres"))
    db_pass = os.getenv("LOCAL_DB_PASSWORD", os.getenv("DB_PASSWORD", "postgrespassword"))
    db_host = os.getenv("LOCAL_DB_HOST", os.getenv("DB_HOST", "127.0.0.1"))
    db_port = os.getenv("LOCAL_DB_PORT", os.getenv("DB_PORT", "5432"))

    if len(sys.argv) > 1 and sys.argv[1] != "test":
        sys.stderr.write(f"\n💻 [CATALOG-API] Usando Base de Datos: LOCAL ({db_host})\n\n")

    return {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": db_name,
            "USER": db_user,
            "PASSWORD": db_pass,
            "HOST": db_host,
            "PORT": db_port,
        }
    }

