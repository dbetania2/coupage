from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, CategoryViewSet

# Router de DRF: genera automáticamente las rutas estándar RESTful
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet, basename='category')

# Inclusión de las rutas generadas por el router
urlpatterns = [
    path('', include(router.urls)),
]
