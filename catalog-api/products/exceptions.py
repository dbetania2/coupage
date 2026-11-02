"""
Excepciones personalizadas del dominio de Catálogo e Inventario.
Cumple con las buenas prácticas de POO y manejo de errores (EAFP).
"""


class CatalogDomainError(Exception):
    """Excepción base para errores de reglas de negocio del catálogo."""

    pass


class StockInsuficienteError(CatalogDomainError):
    """Lanzada cuando una operación requiere más existencias de las disponibles."""

    pass


class DatosInvalidosError(CatalogDomainError):
    """Lanzada cuando los datos de entrada o de importación violan el contrato del dominio."""

    pass


class RangoFechasInvalidoError(CatalogDomainError):
    """Lanzada cuando la fecha de inicio es igual o posterior a la fecha de fin."""

    pass

