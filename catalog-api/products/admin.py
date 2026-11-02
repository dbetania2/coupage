from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Brand, Product, ProductImage, ProductSaleMode, Price, Stock, Promotion

# Personalización institucional del Panel de Administración (Unidad 5.3)
admin.site.site_header = "Coupage | Administración de Catálogo"
admin.site.site_title = "Coupage Admin"
admin.site.index_title = "Tablero de Gestión de Productos, Precios y Stock"


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_at')
    search_fields = ('name',)


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active')
    search_fields = ('name',)


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    readonly_fields = ('image_preview',)

    def image_preview(self, obj: ProductImage) -> str:
        if obj.url:
            return format_html('<img src="{}" style="max-height: 80px; border-radius: 4px;" />', obj.url)
        return ""
    image_preview.short_description = "Vista Previa"


class ProductSaleModeInline(admin.TabularInline):
    model = ProductSaleMode
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'brand', 'is_active')
    list_filter = ('category', 'brand', 'is_active')
    search_fields = ('name', 'category__name', 'brand__name')
    inlines = [ProductImageInline, ProductSaleModeInline]


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'image_preview', 'is_primary', 'display_order')
    list_filter = ('is_primary',)
    readonly_fields = ('image_preview',)

    def image_preview(self, obj: ProductImage) -> str:
        if obj.url:
            return format_html('<img src="{}" style="max-height: 150px; border-radius: 8px;" />', obj.url)
        return "Sin Imagen"
    image_preview.short_description = "Vista Previa"


@admin.register(ProductSaleMode)
class ProductSaleModeAdmin(admin.ModelAdmin):
    list_display = ('product', 'type', 'is_active')
    list_filter = ('type', 'is_active')


@admin.register(Price)
class PriceAdmin(admin.ModelAdmin):
    list_display = ('sale_mode', 'amount', 'valid_from', 'is_active')
    list_filter = ('is_active',)


@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ('sale_mode', 'quantity', 'updated_at')


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ('name', 'discount_type', 'discount_value', 'starts_at', 'ends_at', 'is_active')
    list_filter = ('discount_type', 'is_active')
    search_fields = ('name',)
    filter_horizontal = ('products',)
