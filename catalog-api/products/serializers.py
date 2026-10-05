from rest_framework import serializers
from .models import Category, Brand, Product, ProductImage, ProductSaleMode, Price, Stock

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name']

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

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    sale_modes = ProductSaleModeSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'category', 'brand', 'images', 'sale_modes']
