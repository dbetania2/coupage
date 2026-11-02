"""
Señales del ciclo de vida de los modelos del Catálogo (Patrón Observador).
Implementa normalización previa (pre_save) y registro de auditoría (post_save)
sin acoplar lógica secundaria en vistas o serializadores.
"""

import logging
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from .models import Brand, Category, Product, Stock

logger = logging.getLogger("products.audit")


@receiver(pre_save, sender=Category)
@receiver(pre_save, sender=Brand)
@receiver(pre_save, sender=Product)
def normalizar_nombre_entidad(
    sender: type[Category | Brand | Product],
    instance: Category | Brand | Product,
    **kwargs: object,
) -> None:
    """Limpia espacios en blanco accidentales en los nombres antes de persistir en la BD."""
    if instance.name:
        instance.name = instance.name.strip()


@receiver(post_save, sender=Product)
def auditar_persistencia_producto(
    sender: type[Product],
    instance: Product,
    created: bool,
    **kwargs: object,
) -> None:
    """Registra en el log de auditoría cada alta o modificación de un producto."""
    accion = "CREADO" if created else "ACTUALIZADO"
    logger.info(
        f"Auditoría Catálogo: Producto [{instance.id}] '{instance.name}' {accion} (is_active={instance.is_active})."
    )


@receiver(post_save, sender=Stock)
def auditar_actualizacion_stock(
    sender: type[Stock],
    instance: Stock,
    created: bool,
    **kwargs: object,
) -> None:
    """Registra en el log de auditoría los movimientos de inventario por modalidad."""
    accion = "INICIALIZADO" if created else "MODIFICADO"
    logger.info(
        f"Auditoría Stock: Modalidad [{instance.sale_mode_id}] {accion} con cantidad={instance.quantity}."
    )

