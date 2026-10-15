from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Category, Brand, Product

class CategoryAPITests(APITestCase):
    def setUp(self):
        self.active_category_1 = Category.objects.create(
            name="Vinos",
            description="Vinos tintos y blancos de alta gama",
            is_active=True
        )
        self.active_category_2 = Category.objects.create(
            name="Licores y Espirituosas",
            description="Whiskys y licores premium",
            is_active=True
        )
        self.inactive_category = Category.objects.create(
            name="Categoría Desactivada",
            description="No debería aparecer en el catálogo público",
            is_active=False
        )

    def test_list_categories_returns_only_active(self):
        """Verifica que GET /api/categories/ solo retorne categorías con is_active=True"""
        url = reverse('category-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        category_names = [cat['name'] for cat in response.data]
        self.assertIn("Vinos", category_names)
        self.assertIn("Licores y Espirituosas", category_names)
        self.assertNotIn("Categoría Desactivada", category_names)

    def test_retrieve_category_detail(self):
        """Verifica que GET /api/categories/{id}/ retorne el detalle de una categoría activa"""
        url = reverse('category-detail', args=[self.active_category_1.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.active_category_1.id)
        self.assertEqual(response.data['name'], self.active_category_1.name)


class ProductAPITests(APITestCase):
    def setUp(self):
        self.category_vinos = Category.objects.create(name="Vinos", is_active=True)
        self.category_licores = Category.objects.create(name="Licores", is_active=True)
        self.brand = Brand.objects.create(name="Rutini Wines", is_active=True)

        self.product_vino = Product.objects.create(
            category=self.category_vinos,
            brand=self.brand,
            name="Rutini Malbec",
            description="Gran reserva",
            is_active=True
        )
        self.product_licor = Product.objects.create(
            category=self.category_licores,
            brand=self.brand,
            name="Whisky Rutini Blend",
            description="Edición especial",
            is_active=True
        )

    def test_list_products(self):
        """Verifica que GET /api/products/ retorne la lista de productos"""
        url = reverse('product-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_filter_products_by_category(self):
        """Verifica el filtrado por query parameter ?category=Vinos"""
        url = reverse('product-list')
        response = self.client.get(url, {'category': 'Vinos'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], "Rutini Malbec")
