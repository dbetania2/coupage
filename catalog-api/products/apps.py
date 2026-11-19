from django.apps import AppConfig


class ProductsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'products'

    # Conecta las señales de auditoría cuando Django inicia la aplicación
    def ready(self) -> None:
        import products.signals  # noqa: F401
