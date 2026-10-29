from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.conf import settings
from django.conf.urls.static import static

def health_check(request):
    # Endpoint de verificación de salud para monitoreo y orquestadores (Render, Docker)
    response_data = {
        "status": "ok",
        "service": "catalog-api",
        "message": "Microservicio de Catálogo (Catalog API) activo y funcionando.",
        "version": "1.0.0",
    }
    # Solo expone el enlace a la documentación si Swagger está habilitado
    if getattr(settings, 'ENABLE_SWAGGER', True):
        response_data["swagger_docs"] = "/api/docs/"
    return JsonResponse(response_data)

urlpatterns = [
    path('', health_check, name='health-check'),
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include('products.urls')),
]

# OpenAPI / Swagger UI condicional:
# Permite apagar o encender la documentación interactiva en producción (Render)
# mediante la variable de entorno ENABLE_SWAGGER sin necesidad de reconstruir la imagen o el código.
if getattr(settings, 'ENABLE_SWAGGER', True):
    urlpatterns += [
        path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
        path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    ]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
