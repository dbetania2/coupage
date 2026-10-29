from django.core.management.base import BaseCommand
from django.db import connection
from django.db.utils import OperationalError
from django.db.migrations.executor import MigrationExecutor
from django.conf import settings

class Command(BaseCommand):
    help = 'Verifica la conectividad y el estado de tablas y datos en la base de datos configurada (Local o Render).'

    def handle(self, *args, **options):
        db_settings = settings.DATABASES['default']
        host = db_settings.get('HOST') or 'localhost'
        port = db_settings.get('PORT') or '5432'
        name = db_settings.get('NAME') or ''
        user = db_settings.get('USER') or ''

        self.stdout.write(self.style.MIGRATE_HEADING("\n" + "=" * 65))
        self.stdout.write(self.style.MIGRATE_HEADING(" 🔍 AUDITORÍA DE BASE DE DATOS (CATALOG-API)"))
        self.stdout.write(self.style.MIGRATE_HEADING("=" * 65))
        self.stdout.write(f" 🔌 Host:     {host}:{port}")
        self.stdout.write(f" 🗄️  Database: {name}")
        self.stdout.write(f" 👤 Usuario:  {user}")
        self.stdout.write("-" * 65)

        # 1. Prueba de Conexión
        try:
            connection.ensure_connection()
            self.stdout.write(self.style.SUCCESS(" ✅ Conexión con el motor PostgreSQL: EXITOSA"))
        except OperationalError as e:
            self.stdout.write(self.style.ERROR(f" ❌ ERROR DE CONEXIÓN: No se pudo conectar a la base de datos."))
            self.stdout.write(self.style.ERROR(f"    Detalle: {str(e).strip()}"))
            self.stdout.write(self.style.MIGRATE_HEADING("=" * 65 + "\n"))
            return

        # 2. Verificación de Migraciones
        try:
            executor = MigrationExecutor(connection)
            targets = executor.loader.graph.leaf_nodes()
            plan = executor.migration_plan(targets)
            if not plan:
                self.stdout.write(self.style.SUCCESS(" ✅ Migraciones: Al día (todas las tablas están creadas)"))
            else:
                self.stdout.write(self.style.WARNING(f" ⚠️  Migraciones: Hay {len(plan)} migraciones pendientes."))
                self.stdout.write(self.style.WARNING("    💡 Sugerencia: ejecuta 'python manage.py migrate' para crearlas."))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f" ⚠️  No se pudo leer el historial de migraciones: {e}"))

        # 3. Verificación de Tablas del Dominio
        existing_tables = connection.introspection.table_names()
        if 'products_product' not in existing_tables:
            self.stdout.write(self.style.WARNING(" ⚠️  La tabla 'products_product' aún no existe."))
            self.stdout.write(self.style.MIGRATE_HEADING("=" * 65 + "\n"))
            return

        # 4. Conteo de Datos y Superusuarios
        from products.models import Category, Brand, Product, ProductSaleMode, Price, Stock
        from django.contrib.auth.models import User

        cat_count = Category.objects.count()
        brand_count = Brand.objects.count()
        prod_count = Product.objects.count()
        mode_count = ProductSaleMode.objects.count()
        price_count = Price.objects.count()
        stock_count = Stock.objects.count()
        superusers = list(User.objects.filter(is_superuser=True).values_list('username', flat=True))

        self.stdout.write("-" * 65)
        self.stdout.write(self.style.MIGRATE_LABEL(" 📊 RESUMEN DE REGISTROS EN ESTA BASE DE DATOS:"))
        self.stdout.write(f"    📁 Categorías:          {cat_count}")
        self.stdout.write(f"    🏷️  Marcas:              {brand_count}")
        self.stdout.write(f"    🍷 Productos:           {prod_count}")
        self.stdout.write(f"    📦 Modalidades Venta:   {mode_count}")
        self.stdout.write(f"    💲 Precios cargados:    {price_count}")
        self.stdout.write(f"    📈 Registros de Stock:  {stock_count}")

        if superusers:
            self.stdout.write(self.style.SUCCESS(f"    👑 Superusuarios ({len(superusers)}):   {', '.join(superusers)}"))
        else:
            self.stdout.write(self.style.WARNING("    👑 Superusuarios:       Ninguno registrado (usa 'createsuperuser')"))

        self.stdout.write("-" * 65)
        if prod_count == 0:
            self.stdout.write(self.style.WARNING(" 💡 El catálogo está VACÍO. Para cargar vinos y productos iniciales:"))
            self.stdout.write(self.style.WARNING("    Ejecuta: python seed.py"))
        else:
            self.stdout.write(self.style.SUCCESS(" 🎉 El catálogo cuenta con productos listos para la API."))

        self.stdout.write(self.style.MIGRATE_HEADING("=" * 65 + "\n"))

