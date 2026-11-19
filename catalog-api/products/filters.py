"""
Filtros declarativos con django-filter para el catálogo de productos.
Abstrae la lógica de filtrado fuera de get_queryset() reemplazando condicionales manuales.
"""

import django_filters as filters
from .models import Product


# Filtros declarativos con django-filter para el catálogo
class ProductFilter(filters.FilterSet):
    # Filtro por coincidencia parcial en nombre de categoría
    category = filters.CharFilter(
        field_name="category__name",
        lookup_expr="icontains",
        label="Nombre de Categoría",
    )
    # Filtro por coincidencia parcial en marca o bodega
    brand = filters.CharFilter(
        field_name="brand__name",
        lookup_expr="icontains",
        label="Nombre de Marca / Bodega",
    )
    # Filtro por rango de precio mínimo y máximo
    precio_min = filters.NumberFilter(
        field_name="sale_modes__prices__amount",
        lookup_expr="gte",
        distinct=True,
        label="Precio mínimo",
    )
    precio_max = filters.NumberFilter(
        field_name="sale_modes__prices__amount",
        lookup_expr="lte",
        distinct=True,
        label="Precio máximo",
    )
    # Filtro por estado activo o inactivo
    is_active = filters.BooleanFilter(
        field_name="is_active",
        label="Producto activo",
    )

    class Meta:
        model = Product
        fields = ["category", "brand", "precio_min", "precio_max", "is_active"]

