from rest_framework import viewsets
from .models import Product
from .serializers import ProductSerializer
from drf_spectacular.utils import extend_schema, OpenApiParameter

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
