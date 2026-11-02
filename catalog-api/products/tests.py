from datetime import timedelta
from decimal import Decimal
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Category, Brand, Product, ProductSaleMode, Price, Stock, Promotion


class CategoryAPITests(APITestCase):
    def setUp(self) -> None:
        cache.clear()
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

    def test_list_categories_returns_only_active(self) -> None:
        """Verifica que GET /api/categories/ solo retorne categorías con is_active=True (sin paginación)"""
        url = reverse('category-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        category_names = [cat['name'] for cat in response.data]
        self.assertIn("Vinos", category_names)
        self.assertIn("Licores y Espirituosas", category_names)
        self.assertNotIn("Categoría Desactivada", category_names)

    def test_retrieve_category_detail(self) -> None:
        """Verifica que GET /api/categories/{id}/ retorne el detalle de una categoría activa"""
        url = reverse('category-detail', args=[self.active_category_1.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.active_category_1.id)
        self.assertEqual(response.data['name'], self.active_category_1.name)


class ProductAPITests(APITestCase):
    def setUp(self) -> None:
        cache.clear()
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

    def test_list_products_paginated_contract(self) -> None:
        """Verifica que GET /api/products/ retorne el contrato de PaginacionEstandar (Unidad 8.1)"""
        url = reverse('product-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('count', response.data)
        self.assertIn('total_paginas', response.data)
        self.assertIn('pagina_actual', response.data)
        self.assertIn('results', response.data)
        self.assertEqual(response.data['count'], 2)
        self.assertEqual(len(response.data['results']), 2)

    def test_filter_products_by_category(self) -> None:
        """Verifica el filtrado declarativo con django-filter ?category=Vinos (Unidad 8.2)"""
        url = reverse('product-list')
        response = self.client.get(url, {'category': 'Vinos'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], "Rutini Malbec")

    def test_filter_products_by_nonexistent_category(self) -> None:
        """Verifica que filtrar por una categoría inexistente retorne lista vacía con 200 OK (T04)"""
        url = reverse('product-list')
        response = self.client.get(url, {'category': 'CategoriaInexistenteQueNoExiste'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)

    def test_search_and_ordering_products(self) -> None:
        """Verifica SearchFilter (?search=) y OrderingFilter (?ordering=name) (Unidad 8.3)"""
        url = reverse('product-list')
        search_resp = self.client.get(url, {'search': 'Whisky'})
        self.assertEqual(search_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(search_resp.data['results']), 1)
        self.assertEqual(search_resp.data['results'][0]['name'], "Whisky Rutini Blend")

        order_resp = self.client.get(url, {'ordering': 'name'})
        self.assertEqual(order_resp.status_code, status.HTTP_200_OK)
        names = [item['name'] for item in order_resp.data['results']]
        self.assertEqual(names, ["Rutini Malbec", "Whisky Rutini Blend"])

    def test_custom_actions_stock_and_promotions(self) -> None:
        """Verifica los endpoints personalizados con @action: /stock/ y /promotions/ (Unidad 7.4)"""
        sm = ProductSaleMode.objects.create(product=self.product_vino, type="Unidad", units_per_package=1)
        Price.objects.create(sale_mode=sm, amount=Decimal("15000.00"), valid_from=timezone.now(), is_active=True)
        Stock.objects.create(sale_mode=sm, quantity=12)

        stock_url = reverse('product-stock', args=[self.product_vino.id])
        stock_resp = self.client.get(stock_url)
        self.assertEqual(stock_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(stock_resp.data['product_id'], self.product_vino.id)
        self.assertEqual(stock_resp.data['sale_modes'][0]['quantity'], 12)
        self.assertTrue(stock_resp.data['sale_modes'][0]['is_available'])

        promo_url = reverse('product-promotions')
        promo_resp = self.client.get(promo_url)
        self.assertEqual(promo_resp.status_code, status.HTTP_200_OK)


class ModelValidationAndSignalTests(APITestCase):
    """Pruebas de validaciones de modelo clean(), MinValueValidator y Signals pre_save (Unidad 9)."""

    def setUp(self) -> None:
        cache.clear()
        self.category = Category.objects.create(name="  Vinos con Espacios  ", is_active=True)
        self.product = Product.objects.create(
            category=self.category,
            name="  Malbec Reserva  ",
            is_active=True,
        )
        self.sale_mode = ProductSaleMode.objects.create(
            product=self.product,
            type="Unidad",
            units_per_package=1,
        )

    def test_pre_save_signal_strips_whitespace(self) -> None:
        """Verifica que la señal pre_save normalice nombres quitando espacios accidentales"""
        self.assertEqual(self.category.name, "Vinos con Espacios")
        self.assertEqual(self.product.name, "Malbec Reserva")

    def test_price_clean_rejects_invalid_date_range(self) -> None:
        """Verifica que Price.clean() rechace valid_from >= valid_until"""
        now = timezone.now()
        invalid_price = Price(
            sale_mode=self.sale_mode,
            amount=Decimal("1000.00"),
            valid_from=now,
            valid_until=now - timedelta(days=1),
        )
        with self.assertRaises(ValidationError):
            invalid_price.full_clean()

    def test_promotion_clean_rejects_invalid_dates_and_percentage_over_100(self) -> None:
        """Verifica que Promotion.clean() valide rango de fechas y tope del 100%"""
        now = timezone.now()
        invalid_promo = Promotion(
            name="Promo Inválida",
            discount_type="PERCENTAGE",
            discount_value=Decimal("150.00"),
            starts_at=now,
            ends_at=now + timedelta(days=5),
        )
        with self.assertRaises(ValidationError):
            invalid_promo.full_clean()


class AuthenticationAndPermissionAPITests(APITestCase):
    """
    Pruebas de Autenticación JWT (15m, rotación, Blacklist), Throttling y Permisos (Unidades 8.4 y 10).
    """

    def setUp(self) -> None:
        cache.clear()
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

    def test_obtain_token_success(self) -> None:
        """Verifica generación de token JWT con credenciales válidas"""
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {
            'username': 'admin_test',
            'password': 'PasswordAdmin123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_obtain_token_invalid_credentials(self) -> None:
        """Verifica rechazo con credenciales incorrectas"""
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {
            'username': 'admin_test',
            'password': 'PasswordIncorrecto'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_token_and_blacklist_logout(self) -> None:
        """Verifica rotación de refresh token y revocación en Blacklist al hacer logout (Unidad 10.2)"""
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
        rotated_refresh = refresh_resp.data.get('refresh', refresh_token)

        # Logout enviando el refresh token a la Blacklist
        url_logout = reverse('token_blacklist')
        logout_resp = self.client.post(url_logout, {'refresh': rotated_refresh})
        self.assertEqual(logout_resp.status_code, status.HTTP_200_OK)

        # Intentar reutilizar el refresh token invalidado debe devolver 401
        reuse_resp = self.client.post(url_refresh, {'refresh': rotated_refresh})
        self.assertEqual(reuse_resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_rate_throttling_returns_429(self) -> None:
        """Verifica que superar el límite de 10 intentos por minuto en login dispare HTTP 429 (Unidad 8.4)"""
        url = reverse('token_obtain_pair')
        statuses: list[int] = []
        for _ in range(12):
            resp = self.client.post(url, {'username': 'admin_test', 'password': 'WrongPassword!'})
            statuses.append(resp.status_code)
        self.assertIn(status.HTTP_429_TOO_MANY_REQUESTS, statuses)

    def test_unauthenticated_cannot_create_category(self) -> None:
        """Verifica que usuario sin token no pueda crear categorías (401)"""
        url = reverse('category-list')
        response = self.client.post(url, {'name': 'Nueva Categoria'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_regular_user_cannot_create_category(self) -> None:
        """Verifica que usuario autenticado no admin no pueda crear categorías (403)"""
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

    def test_admin_user_can_create_category(self) -> None:
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

    def test_unauthenticated_cannot_create_product(self) -> None:
        """Verifica que usuario no autenticado no pueda crear productos (401)"""
        url = reverse('product-list')
        response = self.client.post(url, {
            'name': 'Vino Prohibido',
            'category_id': self.category.id
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_user_can_create_product_with_abm_details(self) -> None:
        """Verifica que el admin pueda crear productos completos desde el ABM web vía CatalogService (201)"""
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
            'brand_name': 'Chandon Argentina',
            'price': '28500.00',
            'sale_mode': 'Unidad',
            'image_url': 'http://localhost:8000/media/malbec.png',
            'is_active': True
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created = Product.objects.get(name='Chandon Delice')
        self.assertEqual(created.brand.name, 'Chandon Argentina')
        self.assertEqual(created.sale_modes.first().current_price, Decimal('28500.00'))
