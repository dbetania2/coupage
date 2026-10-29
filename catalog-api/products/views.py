from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAdminUser, SAFE_METHODS
from .models import Product, Category
from .serializers import ProductSerializer, CategorySerializer
from drf_spectacular.utils import extend_schema, OpenApiParameter

@extend_schema(
    description="Endpoint del Catálogo. Lectura pública (GET) y administración protegida por JWT (POST, PUT, PATCH, DELETE)."
)
class CategoryViewSet(viewsets.ModelViewSet):
    """
    Endpoint del Catálogo (Categorías).
    - Métodos seguros (GET, HEAD, OPTIONS): Acceso público.
    - Métodos de modificación (POST, PUT, PATCH, DELETE): Exclusivo para administradores autenticados (JWT).
    """
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        if self.request.user and self.request.user.is_staff:
            return Category.objects.all()
        return Category.objects.filter(is_active=True)


@extend_schema(
    description="Endpoint del Catálogo. Lectura pública con filtrado (GET) y administración protegida por JWT (POST, PUT, PATCH, DELETE)."
)
class ProductViewSet(viewsets.ModelViewSet):
    """
    Endpoint del Catálogo (Productos).
    - Métodos seguros (GET, HEAD, OPTIONS): Acceso público con filtrado por categoría.
    - Métodos de modificación (POST, PUT, PATCH, DELETE): Exclusivo para administradores autenticados (JWT).
    """
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [IsAdminUser()]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='category', description='Filtra los productos por el nombre de la categoría (ej: Vinos)', type=str, required=False),
        ]
    )
    def get_queryset(self):
        queryset = Product.objects.all().prefetch_related(
            'images', 'sale_modes__prices', 'sale_modes__stock', 'category', 'brand'
        )
        if not (self.request.user and self.request.user.is_staff):
            queryset = queryset.filter(is_active=True)

        # Lógica del filtro (RF1)
        category_param = self.request.query_params.get('category')
        if category_param:
            queryset = queryset.filter(category__name__icontains=category_param)
            
        return queryset
