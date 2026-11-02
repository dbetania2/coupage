from django.contrib import admin
from django.urls import path, include
from django.http import HttpRequest, JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.views import (
    TokenBlacklistView,
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from django.conf import settings
from django.conf.urls.static import static


class ThrottledTokenObtainPairView(TokenObtainPairView):
    """Vista de login JWT protegida contra fuerza bruta con ScopedRateThrottle (Unidad 8.4)."""

    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"


def health_check(request: HttpRequest) -> JsonResponse:
    # Endpoint de verificación de salud para monitoreo y orquestadores (Render, Docker)
    response_data: dict[str, str] = {
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
    path('api/token/', ThrottledTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/token/logout/', TokenBlacklistView.as_view(), name='token_blacklist'),
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

# En Render no hay nginx: las imágenes del catálogo van en el propio proceso.
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
