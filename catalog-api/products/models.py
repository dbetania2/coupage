from django.db import models

class Category(models.Model):
    """
    Modelo de Categoría (RF1/RF2): Permite agrupar los productos (ej: Vinos, Licores, Delicatessen) 
    para cumplir con la funcionalidad de "Catálogo navegable y filtrable por categoría".
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name

class Brand(models.Model):
    """
    Modelo de Marca: Complementario al catálogo para mejorar los filtros y la presentación 
    del producto (ej: Rutini, Johnnie Walker).
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    """
    Modelo Central de Producto (RF1): Representa el ítem físico en la vinoteca. 
    Contiene la información base que se muestra en el catálogo digital.
    """
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class ProductImage(models.Model):
    """
    Modelo de Imagen (RF1): Mantiene las fotos separadas del producto para permitir 
    múltiples fotos por ítem. Almacena la URL (CDN/Local) para mantener la BD ligera.
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    url = models.CharField(max_length=500)
    is_primary = models.BooleanField(default=False)
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.product.name}"

class ProductSaleMode(models.Model):
    """
    Modelo de Modalidad de Venta (RF1): Vital para cumplir el requerimiento que exige 
    modalidad de compra ("unidad o paquete/caja"). Un producto puede tener ambas.
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='sale_modes')
    type = models.CharField(max_length=20)
    units_per_package = models.IntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product.name} - {self.type}"

class Price(models.Model):
    """
    Modelo de Precio (RF1): Desacopla el precio de la modalidad de venta. Permite llevar 
    un historial de precios (valid_from / valid_until) y mostrar siempre el "precio actualizado".
    """
    sale_mode = models.ForeignKey(ProductSaleMode, on_delete=models.CASCADE, related_name='prices')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sale_mode} - ${self.amount}"

class Stock(models.Model):
    """
    Modelo de Inventario (RF5/RF8): Permite al personal administrativo verificar 
    la "disponibilidad real" de los productos al revisar las solicitudes de pedidos.
    """
    sale_mode = models.OneToOneField(ProductSaleMode, on_delete=models.CASCADE, related_name='stock')
    quantity = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.sale_mode} - Stock: {self.quantity}"

class Promotion(models.Model):
    """
    Modelo de Promoción: Permite aplicar descuentos temporales a productos específicos, 
    atrayendo clientes en el catálogo público.
    """
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    discount_type = models.CharField(max_length=20)
    discount_value = models.DecimalField(max_digits=12, decimal_places=2)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    products = models.ManyToManyField(Product, related_name='promotions', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
