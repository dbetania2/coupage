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

    def test_filter_products_by_nonexistent_category(self):
        """Verifica que filtrar por una categoría inexistente retorne lista vacía con 200 OK (T04)"""
        url = reverse('product-list')
        response = self.client.get(url, {'category': 'CategoriaInexistenteQueNoExiste'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)


class AuthenticationAndPermissionAPITests(APITestCase):
    """
    Pruebas de Autenticación JWT y Permisos de Escritura (T06).
    Verifica que:
    1. /api/token/ y /api/token/refresh/ generen tokens válidos.
    2. Las peticiones de escritura (POST, PUT, DELETE) estén protegidas y requieran admin.
    """
    def setUp(self):
        from django.contrib.auth.models import User
        self.admin_user = User.objects.create_superuser(
            username='admin_test',
            email='admin@coupage.com',
            password='PasswordAdmin123!'
        )
        self.regular_user = User.objects.create_user(
            username='user_normal',
            email='normal@coupage.com',
            password='PasswordNormal123!'
        )

        self.category = Category.objects.create(name="Espumantes", is_active=True)
        self.brand = Brand.objects.create(name="Chandon", is_active=True)
        self.product = Product.objects.create(
            category=self.category,
            brand=self.brand,
            name="Chandon Extra Brut",
            description="Espumante clásico",
            is_active=True
        )

    def test_obtain_token_success(self):
        """Verifica generación de token JWT con credenciales válidas"""
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {
            'username': 'admin_test',
            'password': 'PasswordAdmin123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_obtain_token_invalid_credentials(self):
        """Verifica rechazo con credenciales incorrectas"""
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {
            'username': 'admin_test',
            'password': 'PasswordIncorrecto'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_token_success(self):
        """Verifica refresco de token con /api/token/refresh/"""
        url_obtain = reverse('token_obtain_pair')
        obtain_resp = self.client.post(url_obtain, {
            'username': 'admin_test',
            'password': 'PasswordAdmin123!'
        })
        refresh_token = obtain_resp.data['refresh']

        url_refresh = reverse('token_refresh')
        refresh_resp = self.client.post(url_refresh, {'refresh': refresh_token})
        self.assertEqual(refresh_resp.status_code, status.HTTP_200_OK)
        self.assertIn('access', refresh_resp.data)

    def test_unauthenticated_cannot_create_category(self):
        """Verifica que usuario sin token no pueda crear categorías (401)"""
        url = reverse('category-list')
        response = self.client.post(url, {'name': 'Nueva Categoria'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_regular_user_cannot_create_category(self):
        """Verifica que usuario autenticado no admin no pueda crear categorías (403)"""
        # Login como usuario normal
        url_obtain = reverse('token_obtain_pair')
        obtain_resp = self.client.post(url_obtain, {
            'username': 'user_normal',
            'password': 'PasswordNormal123!'
        })
        token = obtain_resp.data['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        url = reverse('category-list')
        response = self.client.post(url, {'name': 'Categoria Sin Permiso'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_user_can_create_category(self):
        """Verifica que usuario admin con token JWT pueda crear categorías (201)"""
        url_obtain = reverse('token_obtain_pair')
        obtain_resp = self.client.post(url_obtain, {
            'username': 'admin_test',
            'password': 'PasswordAdmin123!'
        })
        token = obtain_resp.data['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        url = reverse('category-list')
        response = self.client.post(url, {
            'name': 'Cervezas Artesanales',
            'description': 'IPA, APA y Stout'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Category.objects.filter(name='Cervezas Artesanales').count(), 1)

    def test_unauthenticated_cannot_create_product(self):
        """Verifica que usuario no autenticado no pueda crear productos (401)"""
        url = reverse('product-list')
        response = self.client.post(url, {
            'name': 'Vino Prohibido',
            'category_id': self.category.id
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_user_can_create_product(self):
        """Verifica que usuario admin pueda crear productos con JWT (201)"""
        url_obtain = reverse('token_obtain_pair')
        obtain_resp = self.client.post(url_obtain, {
            'username': 'admin_test',
            'password': 'PasswordAdmin123!'
        })
        token = obtain_resp.data['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        url = reverse('product-list')
        response = self.client.post(url, {
            'name': 'Chandon Delice',
            'description': 'Espumante dulce refrescante',
            'category_id': self.category.id,
            'brand_id': self.brand.id,
            'is_active': True
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.filter(name='Chandon Delice').count(), 1)
