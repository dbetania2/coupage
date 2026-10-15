from rest_framework import viewsets
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer
from drf_spectacular.utils import extend_schema, OpenApiParameter

@extend_schema(
    description="Endpoint del Catálogo Público (RF1). Retorna la lista de categorías activas para el filtrado del catálogo."
)
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoint del Catálogo Público (RF1).
    Solo permite lectura (GET). Retorna únicamente las categorías activas.
    """
    serializer_class = CategorySerializer
    queryset = Category.objects.filter(is_active=True)


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoint del Catálogo Público (RF1).
    Solo permite lectura (GET). Incluye un filtro para la categoría.
    """
    serializer_class = ProductSerializer

    @extend_schema(
        parameters=[
            OpenApiParameter(name='category', description='Filtra los productos por el nombre de la categoría (ej: Vinos)', type=str, required=False),
        ]
    )
    def get_queryset(self):
        # Usamos prefetch_related para que la BD sea súper rápida y no haga consultas extra
        queryset = Product.objects.filter(is_active=True).prefetch_related(
            'images', 'sale_modes__prices', 'sale_modes__stock', 'category', 'brand'
        )
        
        # Lógica del filtro (RF1)
        category_param = self.request.query_params.get('category')
        if category_param:
            queryset = queryset.filter(category__name__icontains=category_param)
            
        return queryset
