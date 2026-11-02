"""
Script de Seed (Carga de Datos Iniciales) - Cumplimiento de Tarea T03 (#10)

Justificación de creación:
De acuerdo al plan de trabajo (Historia de Usuario 1), este script cumple con la Tarea Técnica T03:
"Carga de Datos Iniciales y Fixtures del Catálogo (Seed Data)".

Buenas prácticas aplicadas:
- Protección de entorno: bloquea la ejecución si DB_MODE='render' para no alterar ni borrar la base real en la nube.
- Unidad 9.2: Invocación explícita de obj.full_clean() antes de persistir con save() para ejecutar
  los validadores de campo y el método clean() fuera de DRF/Admin.
"""

import os
from datetime import datetime
from decimal import Decimal
import django
from django.utils.timezone import make_aware

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "catalog.settings")
django.setup()

from products.models import (  # noqa: E402
    Brand,
    Category,
    Price,
    Product,
    ProductImage,
    ProductSaleMode,
    Stock,
)


def _save_validated(instance: django.db.models.Model) -> None:
    """Ejecuta full_clean() explícitamente antes de guardar en la base de datos."""
    instance.full_clean()
    instance.save()


def run() -> None:
    db_mode = os.getenv("DB_MODE", "local").strip().lower()
    is_on_render = bool(os.getenv("RENDER") or os.getenv("RENDER_EXTERNAL_HOSTNAME"))
    if is_on_render or db_mode == "render":
        print(
            "⛔ [PROTECCIÓN] Ejecución cancelada: DB_MODE está apuntando a 'render'. "
            "No se ejecuta el seed sobre la base de datos real para no borrar ni alterar datos del servidor."
        )
        return

    print("Limpiando datos viejos en base local...")
    Product.objects.all().delete()
    Category.objects.all().delete()
    Brand.objects.all().delete()

    print("Creando Categorías...")
    cat_vinos = Category(name="Vinos", description="Vinos tintos, blancos y rosados de alta gama.")
    _save_validated(cat_vinos)
    cat_licores = Category(name="Licores y Espirituosas", description="Whiskys, gin y licores importados.")
    _save_validated(cat_licores)
    cat_deli = Category(name="Delicatessen", description="Quesos, embutidos ibéricos y trufas.")
    _save_validated(cat_deli)

    print("Creando Marcas...")
    brand_rutini = Brand(name="Rutini Wines")
    _save_validated(brand_rutini)
    brand_jw = Brand(name="Johnnie Walker")
    _save_validated(brand_jw)
    brand_catena = Brand(name="Catena Zapata")
    _save_validated(brand_catena)
    brand_zuccardi = Brand(name="Familia Zuccardi")
    _save_validated(brand_zuccardi)
    brand_iberico = Brand(name="Joselito")
    _save_validated(brand_iberico)

    print("Creando Productos validando con full_clean()...")
    # 1. Rutini (Vino)
    p1 = Product(
        category=cat_vinos,
        brand=brand_rutini,
        name="Rutini Cabernet Malbec",
        description=(
            "Un vino tinto elegante, con notas de frutos rojos maduros, vainilla y un final persistente en boca. "
            "Su crianza en barrica de roble francés le otorga una estructura inigualable. "
            "Ideal para acompañar carnes rojas y pastas trufadas."
        ),
    )
    _save_validated(p1)
    _save_validated(ProductImage(product=p1, url="http://localhost:8000/media/malbec.png", is_primary=True))
    sm1 = ProductSaleMode(product=p1, type="Unidad", units_per_package=1)
    _save_validated(sm1)
    _save_validated(Price(sale_mode=sm1, amount=Decimal("12500.00"), valid_from=make_aware(datetime.now())))
    _save_validated(Stock(sale_mode=sm1, quantity=50))

    # 2. Catena Zapata (Vino)
    p2 = Product(
        category=cat_vinos,
        brand=brand_catena,
        name="Catena Zapata Malbec Argentino",
        description=(
            "Una verdadera joya de la vitivinicultura argentina. Blend de uvas provenientes de dos viñedos históricos. "
            "Ofrece aromas intensos a cassis y moca, con una textura aterciopelada y taninos dulces."
        ),
    )
    _save_validated(p2)
    _save_validated(
        ProductImage(
            product=p2,
            url="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=1080&auto=format&fit=crop",
            is_primary=True,
        )
    )
    sm2 = ProductSaleMode(product=p2, type="Unidad", units_per_package=1)
    _save_validated(sm2)
    _save_validated(Price(sale_mode=sm2, amount=Decimal("115000.00"), valid_from=make_aware(datetime.now())))
    _save_validated(Stock(sale_mode=sm2, quantity=15))

    # 3. Zuccardi (Vino)
    p3 = Product(
        category=cat_vinos,
        brand=brand_zuccardi,
        name="Zuccardi Aluvional Gualtallary",
        description=(
            "La máxima expresión del Valle de Uco. Un Malbec profundo, con marcada mineralidad, notas de tiza y frutas negras. "
            "Posee una acidez vibrante que le augura una excelente capacidad de guarda."
        ),
    )
    _save_validated(p3)
    _save_validated(
        ProductImage(
            product=p3,
            url="https://images.unsplash.com/photo-1569529465841-dfecdab7503b?q=80&w=1080&auto=format&fit=crop",
            is_primary=True,
        )
    )
    sm3 = ProductSaleMode(product=p3, type="Unidad", units_per_package=1)
    _save_validated(sm3)
    _save_validated(Price(sale_mode=sm3, amount=Decimal("145000.00"), valid_from=make_aware(datetime.now())))
    _save_validated(Stock(sale_mode=sm3, quantity=8))

    # 4. Johnnie Walker (Licores)
    p4 = Product(
        category=cat_licores,
        brand=brand_jw,
        name="Johnnie Walker Blue Label",
        description=(
            "Blend escocés extraordinario y exclusivo, creado con algunos de los whiskies más raros y excepcionales de Escocia. "
            "Un regalo inigualable con notas de miel, avellanas y un toque de humo sutil."
        ),
    )
    _save_validated(p4)
    _save_validated(
        ProductImage(
            product=p4,
            url="https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=1080&auto=format&fit=crop",
            is_primary=True,
        )
    )
    sm4 = ProductSaleMode(product=p4, type="Unidad", units_per_package=1)
    _save_validated(sm4)
    _save_validated(Price(sale_mode=sm4, amount=Decimal("350000.00"), valid_from=make_aware(datetime.now())))
    _save_validated(Stock(sale_mode=sm4, quantity=5))

    # 5. Queso Ibérico (Delicatessen)
    p5 = Product(
        category=cat_deli,
        brand=brand_iberico,
        name="Queso Manchego Curado Añejo",
        description=(
            "Auténtico queso manchego de leche cruda de oveja, con una maduración superior a 12 meses. "
            "Sabor intenso, ligeramente picante y textura firme. El acompañamiento perfecto para un gran reserva."
        ),
    )
    _save_validated(p5)
    _save_validated(
        ProductImage(
            product=p5,
            url="https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?q=80&w=1080&auto=format&fit=crop",
            is_primary=True,
        )
    )
    sm5 = ProductSaleMode(product=p5, type="Porción 250g", units_per_package=1)
    _save_validated(sm5)
    _save_validated(Price(sale_mode=sm5, amount=Decimal("25000.00"), valid_from=make_aware(datetime.now())))
    _save_validated(Stock(sale_mode=sm5, quantity=20))

    print("¡Datos cargados y validados exitosamente!")


if __name__ == "__main__":
    run()
