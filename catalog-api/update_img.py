"""
Script de Automatización (Extensión del Seed)

Justificación:
Este script fue creado como una herramienta de automatización rápida para enlazar una 
imagen de ejemplo (archivo local) a los datos generados por el script de seed (T03).
Sirve para verificar que la configuración de archivos estáticos (media) en Django 
funciona correctamente sin necesidad de realizar la carga manualmente por el panel de administración.
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'catalog.settings')
django.setup()

from products.models import Product, ProductImage

def update_image():
    # Buscamos el vino Rutini que creamos antes
    rutini = Product.objects.filter(name="Rutini Cabernet Malbec").first()
    if rutini:
        # Buscamos su imagen principal
        img = ProductImage.objects.filter(product=rutini, is_primary=True).first()
        if img:
            # Actualizamos la URL para que apunte a la foto que subiste
            img.url = "http://localhost:8000/media/malbec.png"
            img.save()
            print("¡Imagen del Rutini actualizada con éxito a la versión local!")
        else:
            print("No se encontró la imagen.")
    else:
        print("No se encontró el producto.")

if __name__ == '__main__':
    update_image()
