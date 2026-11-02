from django.db.models import QuerySet
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import AllowAny, BasePermission, IsAdminUser, SAFE_METHODS
from rest_framework.request import Request
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter

from .filters import ProductFilter
from .models import Product, Category
from .pagination import PaginacionEstandar
from .serializers import ProductSerializer, CategorySerializer, PromotionSerializer
from .services import CatalogService


@extend_schema(
    description="Endpoint del Catálogo (Categorías). Lectura pública (GET) y administración protegida por JWT (POST, PUT, PATCH, DELETE)."
)
class CategoryViewSet(viewsets.ModelViewSet):
    """
    Endpoint del Catálogo (Categorías).
    - Métodos seguros (GET, HEAD, OPTIONS): Acceso público.
    - Métodos de modificación (POST, PUT, PATCH, DELETE): Exclusivo para administradores autenticados (JWT).
    - Paginación desactivada (pagination_class = None) para poblar selectores del catálogo.
    """
    serializer_class = CategorySerializer
    pagination_class = None

    def get_permissions(self) -> list[BasePermission]:
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self) -> QuerySet[Category]:
        is_staff = bool(self.request.user and self.request.user.is_staff)
        return CatalogService.get_category_queryset(is_staff=is_staff)


@extend_schema(
    description="Endpoint del Catálogo (Productos). Soporta paginación, filtrado con django-filter, búsqueda global y ordenamiento por lista blanca."
)
class ProductViewSet(viewsets.ModelViewSet):
    """
    Endpoint del Catálogo (Productos).
    - Métodos seguros (GET, HEAD, OPTIONS): Acceso público con filtrado declarativo, búsqueda y ordenamiento.
    - Métodos de modificación (POST, PUT, PATCH, DELETE): Exclusivo para administradores autenticados (JWT).
    """
    serializer_class = ProductSerializer
    pagination_class = PaginacionEstandar
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['^name', 'description', 'brand__name']
    ordering_fields = ['name', 'created_at', 'id']
    ordering = ['-id']

    def get_permissions(self) -> list[BasePermission]:
        if self.request.method in SAFE_METHODS:
            return [AllowAny()]
        return [IsAdminUser()]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='category', description='Filtra los productos por el nombre de la categoría (ej: Vinos)', type=str, required=False),
            OpenApiParameter(name='brand', description='Filtra los productos por marca o bodega', type=str, required=False),
            OpenApiParameter(name='search', description='Búsqueda por texto en nombre, descripción y marca', type=str, required=False),
            OpenApiParameter(name='ordering', description='Ordenamiento por lista blanca (name, -name, created_at, -created_at)', type=str, required=False),
        ]
    )
    def get_queryset(self) -> QuerySet[Product]:
        is_staff = bool(self.request.user and self.request.user.is_staff)
        return CatalogService.get_product_queryset(is_staff=is_staff)

    @extend_schema(
        description="Retorna las promociones vigentes y activas del catálogo."
    )
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def promotions(self, request: Request) -> Response:
        promos = CatalogService.get_active_promotions()
        pagina = self.paginate_queryset(promos)
        if pagina is not None:
            serializer = PromotionSerializer(pagina, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = PromotionSerializer(promos, many=True)
        return Response(serializer.data)

    @extend_schema(
        description="Consulta el desglose de modalidades y existencias disponibles de un producto específico."
    )
    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def stock(self, request: Request, pk: str | None = None) -> Response:
        product = self.get_object()
        modalidades = [
            {
                "sale_mode_id": sm.id,
                "type": sm.type,
                "price": sm.current_price,
                "quantity": sm.stock.quantity if hasattr(sm, "stock") else 0,
                "is_available": sm.stock.is_available if hasattr(sm, "stock") else False,
            }
            for sm in product.sale_modes.all()
        ]
        return Response(
            {
                "product_id": product.id,
                "product_name": product.name,
                "sale_modes": modalidades,
            }
        )
