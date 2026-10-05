"""
Script de Seed (Carga de Datos Iniciales) - Cumplimiento de Tarea T03

Justificación de creación:
De acuerdo al plan de trabajo (Historia de Usuario 1), este script cumple con la Tarea Técnica T03:
"Carga de Datos Iniciales y Fixtures del Catálogo (Seed Data)".

¿Por qué lo creamos?
Al desarrollar el frontend (Next.js) y configurar los endpoints de filtrado, los desarrolladores 
necesitan información realista y completa (fotos, precios, modalidades) para probar que todo funcione 
correctamente. Este script automatiza la carga de productos de alta calidad para no tener que hacerlo 
a mano cada vez que se levanta la base de datos desde cero.
"""

import os
import django
from datetime import datetime
from django.utils.timezone import make_aware

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'catalog.settings')
django.setup()

from products.models import Category, Brand, Product, ProductImage, ProductSaleMode, Price, Stock

def run():
    print("Limpiando datos viejos...")
    Category.objects.all().delete()
    Brand.objects.all().delete()
    
    print("Creando Categorías...")
    cat_vinos = Category.objects.create(name="Vinos", description="Vinos tintos, blancos y rosados de alta gama.")
    cat_licores = Category.objects.create(name="Licores y Espirituosas", description="Whiskys, gin y licores importados.")
    
    print("Creando Marcas...")
    brand_rutini = Brand.objects.create(name="Rutini Wines")
    brand_jw = Brand.objects.create(name="Johnnie Walker")

    print("Creando Productos...")
    # Producto 1: Vino
    p1 = Product.objects.create(
        category=cat_vinos,
        brand=brand_rutini,
        name="Rutini Cabernet Malbec",
        description="Un vino tinto elegante, con notas de frutos rojos y un final persistente en boca. Ideal para acompañar carnes rojas y pastas."
    )
    
    # Imagen de alta calidad (Usando URL de banco de imágenes HD)
    ProductImage.objects.create(
        product=p1,
        url="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=1080&auto=format&fit=crop", 
        is_primary=True
    )
    
    # Modalidades de venta
    sm1_unidad = ProductSaleMode.objects.create(product=p1, type="Unidad", units_per_package=1)
    Price.objects.create(sale_mode=sm1_unidad, amount=12500.00, valid_from=make_aware(datetime.now()))
    Stock.objects.create(sale_mode=sm1_unidad, quantity=50)

    sm1_caja = ProductSaleMode.objects.create(product=p1, type="Caja (6 un.)", units_per_package=6)
    Price.objects.create(sale_mode=sm1_caja, amount=70000.00, valid_from=make_aware(datetime.now()))
    Stock.objects.create(sale_mode=sm1_caja, quantity=10)

    # Producto 2: Licor Premium
    p2 = Product.objects.create(
        category=cat_licores,
        brand=brand_jw,
        name="Johnnie Walker Blue Label",
        description="Blend escocés extraordinario, creado con algunos de los whiskies más raros y excepcionales de Escocia. Un regalo inigualable."
    )
    
    ProductImage.objects.create(
        product=p2,
        url="https://images.unsplash.com/photo-1569529465841-dfecdab7503b?q=80&w=1080&auto=format&fit=crop",
        is_primary=True
    )
    
    sm2_unidad = ProductSaleMode.objects.create(product=p2, type="Unidad", units_per_package=1)
    Price.objects.create(sale_mode=sm2_unidad, amount=350000.00, valid_from=make_aware(datetime.now()))
    Stock.objects.create(sale_mode=sm2_unidad, quantity=5)

    print("¡Datos cargados exitosamente!")

if __name__ == '__main__':
    run()
