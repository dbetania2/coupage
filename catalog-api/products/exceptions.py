"""
Excepciones personalizadas del dominio de Catálogo e Inventario.
Heredan de ValidationError de Django para mantener compatibilidad nativa
con el ciclo de validación del ORM (full_clean) y serializadores de DRF.
"""

from django.core.exceptions import ValidationError


class CatalogDomainError(ValidationError):
    """Error base para cualquier problema del catálogo e inventario."""

    pass


class StockInsuficienteError(CatalogDomainError):
    """Error cuando se pide más cantidad de la que hay en stock."""

    pass


class DatosInvalidosError(CatalogDomainError):
    """Error cuando se ingresan datos incorrectos o incompletos."""

    pass


class RangoFechasInvalidoError(CatalogDomainError):
    """Error cuando la fecha de inicio es mayor o igual a la fecha de fin."""

    pass


# TODO (Escalabilidad de Excepciones de Dominio):
# 1. Agregar nuevas clases hijas de CatalogDomainError para cubrir todas las invariantes del catálogo:
#    - ProductoInactivoError: cuando se intenta operar o promocionar un producto con is_active=False.
#    - CategoriaProtegidaError: cuando se intenta eliminar una categoría con productos asociados (PROTECT).
#    - ModalidadDuplicadaError: cuando se intenta registrar dos veces la misma modalidad (ej. "Unidad") en un producto.
# 2. Conectar esta jerarquía con un custom_exception_handler en DRF para traducir automáticamente
#    cualquier CatalogDomainError a respuestas HTTP 400 / 409 / 422 estandarizadas.
