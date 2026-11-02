from rest_framework import serializers
from .models import (
    Category,
    Brand,
    Product,
    ProductImage,
    ProductSaleMode,
    Price,
    Stock,
    Promotion,
)
from .services import CatalogService


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'is_active']


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'is_active']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'url', 'is_primary']


class PriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Price
        fields = ['amount']


class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = ['quantity']


class ProductSaleModeSerializer(serializers.ModelSerializer):
    prices = PriceSerializer(many=True, read_only=True)
    stock = StockSerializer(read_only=True)

    class Meta:
        model = ProductSaleMode
        fields = ['id', 'type', 'units_per_package', 'prices', 'stock']


class PromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = [
            'id',
            'name',
            'description',
            'discount_type',
            'discount_value',
            'starts_at',
            'ends_at',
            'is_active',
        ]


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True, required=False
    )
    brand_id = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(), source='brand', write_only=True, required=False, allow_null=True
    )
    # Campos write_only opcionales enviados desde el formulario ABM del panel administrativo web
    brand_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    price = serializers.DecimalField(
        max_digits=12, decimal_places=2, write_only=True, required=False, allow_null=True
    )
    sale_mode = serializers.CharField(write_only=True, required=False, allow_blank=True)
    image_url = serializers.CharField(write_only=True, required=False, allow_blank=True)
    stock_quantity = serializers.IntegerField(write_only=True, required=False, min_value=0)

    images = ProductImageSerializer(many=True, read_only=True)
    sale_modes = ProductSaleModeSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'description',
            'category',
            'brand',
            'category_id',
            'brand_id',
            'brand_name',
            'price',
            'sale_mode',
            'image_url',
            'stock_quantity',
            'images',
            'sale_modes',
            'is_active',
        ]

    def create(self, validated_data: dict[str, object]) -> Product:
        return CatalogService.create_product_with_details(validated_data)

    def update(self, instance: Product, validated_data: dict[str, object]) -> Product:
        return CatalogService.update_product_with_details(instance, validated_data)
