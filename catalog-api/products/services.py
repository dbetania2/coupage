"""
Capa de Servicios (Service Layer) del dominio de Catálogo (Unidad 10.4).
Desacopla las consultas optimizadas del ORM y las transacciones de creación/edición
compuestas (Producto + Marca + Modalidad + Precio + Stock + Imagen) de las vistas HTTP.
"""

from decimal import Decimal
from django.db import transaction
from django.db.models import QuerySet
from django.utils import timezone
from .models import (
    Brand,
    Category,
    Price,
    Product,
    ProductImage,
    ProductSaleMode,
    Promotion,
    Stock,
)


class CatalogService:
    """Servicio de aplicación para operaciones de lectura y escritura del catálogo."""

    @staticmethod
    def get_category_queryset(is_staff: bool = False) -> QuerySet[Category]:
        """Retorna el QuerySet de categorías según los privilegios del usuario."""
        queryset = Category.objects.all().order_by("id")
        if not is_staff:
            queryset = queryset.filter(is_active=True)
        return queryset

    @staticmethod
    def get_product_queryset(is_staff: bool = False) -> QuerySet[Product]:
        """
        Retorna el QuerySet de productos optimizado con prefetch_related
        para evitar el problema de las N+1 consultas SQL (Unidad 4.3).
        """
        queryset = (
            Product.objects.all()
            .prefetch_related(
                "images",
                "sale_modes__prices",
                "sale_modes__stock",
                "category",
                "brand",
            )
            .order_by("-id")
        )
        if not is_staff:
            queryset = queryset.filter(is_active=True)
        return queryset

    @staticmethod
    def get_active_promotions() -> QuerySet[Promotion]:
        """Retorna las promociones vigentes y activas en la fecha actual."""
        now = timezone.now()
        return Promotion.objects.filter(
            is_active=True,
            starts_at__lte=now,
            ends_at__gte=now,
        ).prefetch_related("products")

    @staticmethod
    @transaction.atomic
    def create_product_with_details(validated_data: dict[str, object]) -> Product:
        """
        Crea un producto y sincroniza de forma atómica su marca, modalidad de venta,
        precio vigente, stock inicial e imagen principal (usado por el ABM web).
        """
        brand_name = str(validated_data.pop("brand_name", "") or "").strip()
        price_val = validated_data.pop("price", None)
        sale_mode_type = str(validated_data.pop("sale_mode", "") or "Unidad").strip()
        image_url = str(validated_data.pop("image_url", "") or "").strip()
        stock_qty = validated_data.pop("stock_quantity", 50)

        if brand_name and not validated_data.get("brand"):
            brand_obj, _ = Brand.objects.get_or_create(name=brand_name)
            validated_data["brand"] = brand_obj

        product = Product.objects.create(**validated_data)

        if image_url:
            ProductImage.objects.create(
                product=product,
                url=image_url,
                is_primary=True,
                display_order=0,
            )

        if price_val is not None or sale_mode_type:
            sale_mode = ProductSaleMode.objects.create(
                product=product,
                type=sale_mode_type or "Unidad",
                units_per_package=1,
                is_active=True,
            )
            amount = Decimal(str(price_val)) if price_val and Decimal(str(price_val)) > 0 else Decimal("0.01")
            Price.objects.create(
                sale_mode=sale_mode,
                amount=amount,
                valid_from=timezone.now(),
                is_active=True,
            )
            Stock.objects.create(
                sale_mode=sale_mode,
                quantity=int(stock_qty) if stock_qty is not None else 50,
            )

        return product

    @staticmethod
    @transaction.atomic
    def update_product_with_details(
        instance: Product, validated_data: dict[str, object]
    ) -> Product:
        """
        Actualiza un producto existente y sus entidades compuestas (marca, modalidad,
        precio e imagen) en una única transacción.
        """
        brand_name = validated_data.pop("brand_name", None)
        price_val = validated_data.pop("price", None)
        sale_mode_type = validated_data.pop("sale_mode", None)
        image_url = validated_data.pop("image_url", None)
        stock_qty = validated_data.pop("stock_quantity", None)

        if brand_name is not None:
            clean_brand = str(brand_name).strip()
            if clean_brand:
                brand_obj, _ = Brand.objects.get_or_create(name=clean_brand)
                instance.brand = brand_obj
            else:
                instance.brand = None

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if image_url is not None and str(image_url).strip():
            primary_img = instance.images.filter(is_primary=True).first() or instance.images.first()
            if primary_img:
                primary_img.url = str(image_url).strip()
                primary_img.save()
            else:
                ProductImage.objects.create(
                    product=instance,
                    url=str(image_url).strip(),
                    is_primary=True,
                )

        if price_val is not None or sale_mode_type is not None or stock_qty is not None:
            sale_mode = instance.sale_modes.first()
            if not sale_mode:
                sale_mode = ProductSaleMode.objects.create(
                    product=instance,
                    type=str(sale_mode_type or "Unidad").strip(),
                    units_per_package=1,
                    is_active=True,
                )
            elif sale_mode_type is not None and str(sale_mode_type).strip():
                sale_mode.type = str(sale_mode_type).strip()
                sale_mode.save()

            if price_val is not None and Decimal(str(price_val)) > 0:
                price_obj = sale_mode.prices.filter(is_active=True).order_by("-valid_from").first()
                if price_obj:
                    price_obj.amount = Decimal(str(price_val))
                    price_obj.save()
                else:
                    Price.objects.create(
                        sale_mode=sale_mode,
                        amount=Decimal(str(price_val)),
                        valid_from=timezone.now(),
                        is_active=True,
                    )

            if stock_qty is not None:
                stock_obj, _ = Stock.objects.get_or_create(sale_mode=sale_mode)
                stock_obj.quantity = int(stock_qty)
                stock_obj.save()

        return instance
