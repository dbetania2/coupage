"""Arranque de producción: migraciones, estáticos y Gunicorn."""
import os
import subprocess
import sys


def run(args):
    subprocess.check_call([sys.executable, *args])


def main():
    run(["manage.py", "migrate", "--noinput"])
    run(["manage.py", "collectstatic", "--noinput"])

    port = os.environ.get("PORT", "8000")
    workers = os.environ.get("WEB_CONCURRENCY", "1")
    timeout = os.environ.get("GUNICORN_TIMEOUT", "60")

    os.execvp(
        sys.executable,
        [
            sys.executable,
            "-m",
            "gunicorn",
            "catalog.wsgi:application",
            "--bind",
            f"0.0.0.0:{port}",
            "--workers",
            workers,
            "--timeout",
            timeout,
            "--access-logfile",
            "-",
            "--error-logfile",
            "-",
        ],
    )


if __name__ == "__main__":
    main()
