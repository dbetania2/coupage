"""
Configuración de paginación estándar para la API de Catálogo.
Fragmenta las respuestas en páginas e informa métricas de navegación.
"""

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


# Configuración de paginación estándar (10 ítems por página)
class PaginacionEstandar(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100

    # Estructura del contrato JSON devuelto con metadatos de navegación
    def get_paginated_response(self, data: list[object]) -> Response:
        return Response(
            {
                "count": self.page.paginator.count,
                "total_paginas": self.page.paginator.num_pages,
                "pagina_actual": self.page.number,
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "results": data,
            }
        )

