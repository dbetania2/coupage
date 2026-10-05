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
    Product.objects.all().delete()
    Category.objects.all().delete()
    Brand.objects.all().delete()
    
    print("Creando Categorías...")
    cat_vinos = Category.objects.create(name="Vinos", description="Vinos tintos, blancos y rosados de alta gama.")
    cat_licores = Category.objects.create(name="Licores y Espirituosas", description="Whiskys, gin y licores importados.")
    cat_deli = Category.objects.create(name="Delicatessen", description="Quesos, embutidos ibéricos y trufas.")
    
    print("Creando Marcas...")
    brand_rutini = Brand.objects.create(name="Rutini Wines")
    brand_jw = Brand.objects.create(name="Johnnie Walker")
    brand_catena = Brand.objects.create(name="Catena Zapata")
    brand_zuccardi = Brand.objects.create(name="Familia Zuccardi")
    brand_iberico = Brand.objects.create(name="Joselito")

    print("Creando Productos...")
    # 1. Rutini (Vino)
    p1 = Product.objects.create(
        category=cat_vinos, 
        brand=brand_rutini, 
        name="Rutini Cabernet Malbec",
        description="Un vino tinto elegante, con notas de frutos rojos maduros, vainilla y un final persistente en boca. Su crianza en barrica de roble francés le otorga una estructura inigualable. Ideal para acompañar carnes rojas y pastas trufadas."
    )
    ProductImage.objects.create(product=p1, url="http://localhost:8000/media/malbec.png", is_primary=True)
    sm1 = ProductSaleMode.objects.create(product=p1, type="Unidad", units_per_package=1)
    Price.objects.create(sale_mode=sm1, amount=12500.00, valid_from=make_aware(datetime.now()))
    Stock.objects.create(sale_mode=sm1, quantity=50)

    # 2. Catena Zapata (Vino)
    p2 = Product.objects.create(
        category=cat_vinos, 
        brand=brand_catena, 
        name="Catena Zapata Malbec Argentino",
        description="Una verdadera joya de la vitivinicultura argentina. Blend de uvas provenientes de dos viñedos históricos. Ofrece aromas intensos a cassis y moca, con una textura aterciopelada y taninos dulces."
    )
    ProductImage.objects.create(product=p2, url="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=1080&auto=format&fit=crop", is_primary=True)
    sm2 = ProductSaleMode.objects.create(product=p2, type="Unidad", units_per_package=1)
    Price.objects.create(sale_mode=sm2, amount=115000.00, valid_from=make_aware(datetime.now()))
    Stock.objects.create(sale_mode=sm2, quantity=15)

    # 3. Zuccardi (Vino)
    p3 = Product.objects.create(
        category=cat_vinos, 
        brand=brand_zuccardi, 
        name="Zuccardi Aluvional Gualtallary",
        description="La máxima expresión del Valle de Uco. Un Malbec profundo, con marcada mineralidad, notas de tiza y frutas negras. Posee una acidez vibrante que le augura una excelente capacidad de guarda."
    )
    ProductImage.objects.create(product=p3, url="https://images.unsplash.com/photo-1569529465841-dfecdab7503b?q=80&w=1080&auto=format&fit=crop", is_primary=True)
    sm3 = ProductSaleMode.objects.create(product=p3, type="Unidad", units_per_package=1)
    Price.objects.create(sale_mode=sm3, amount=145000.00, valid_from=make_aware(datetime.now()))
    Stock.objects.create(sale_mode=sm3, quantity=8)

    # 4. Johnnie Walker (Licores)
    p4 = Product.objects.create(
        category=cat_licores, 
        brand=brand_jw, 
        name="Johnnie Walker Blue Label",
        description="Blend escocés extraordinario y exclusivo, creado con algunos de los whiskies más raros y excepcionales de Escocia. Un regalo inigualable con notas de miel, avellanas y un toque de humo sutil."
    )
    ProductImage.objects.create(product=p4, url="https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=1080&auto=format&fit=crop", is_primary=True)
    sm4 = ProductSaleMode.objects.create(product=p4, type="Unidad", units_per_package=1)
    Price.objects.create(sale_mode=sm4, amount=350000.00, valid_from=make_aware(datetime.now()))
    Stock.objects.create(sale_mode=sm4, quantity=5)

    # 5. Queso Ibérico (Delicatessen)
    p5 = Product.objects.create(
        category=cat_deli, 
        brand=brand_iberico, 
        name="Queso Manchego Curado Añejo",
        description="Auténtico queso manchego de leche cruda de oveja, con una maduración superior a 12 meses. Sabor intenso, ligeramente picante y textura firme. El acompañamiento perfecto para un gran reserva."
    )
    ProductImage.objects.create(product=p5, url="https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?q=80&w=1080&auto=format&fit=crop", is_primary=True)
    sm5 = ProductSaleMode.objects.create(product=p5, type="Porción 250g", units_per_package=1)
    Price.objects.create(sale_mode=sm5, amount=25000.00, valid_from=make_aware(datetime.now()))
    Stock.objects.create(sale_mode=sm5, quantity=20)

    print("¡Datos cargados exitosamente!")

if __name__ == '__main__':
    run()
