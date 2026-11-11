/**
 * Sanitiza un documento de pedido eliminando datos personales sensibles (email, teléfono, dirección exacta)
 * antes de enviarlo al contexto del modelo externo.
 */
export function sanitizeOrderForLLM(order) {
  const rawName = order.customer?.name || 'Cliente';
  const nameParts = rawName.trim().split(/\s+/);
  const maskedName =
    nameParts.length > 1
      ? `${nameParts[0]} ${nameParts[1][0]}.`
      : rawName;

  return {
    orderNumber: order.orderNumber || order.id,
    status: order.status,
    totalAmount: Number(order.totalAmount || 0),
    customerAlias: maskedName,
    createdAt: order.createdAt,
    items: (order.items || []).map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice || 0),
      subtotal: Number(item.subtotal || item.unitPrice * item.quantity || 0),
    })),
    lastHistoryNote:
      Array.isArray(order.history) && order.history.length > 0
        ? order.history[order.history.length - 1].note || ''
        : '',
  };
}

/**
 * Definición declarativa de las 4 herramientas de solo lectura en formato JSON Schema
 */
export const AI_TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'get_orders_summary',
      description:
        'Obtiene el resumen operativo general de solicitudes de pedido: cantidad por estado (PENDIENTE, CONFIRMADO, PREPARADO, ENTREGADO, CANCELADO, RECHAZADO) y montos totales.',
      parameters: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            description:
              'Filtro opcional por estado (PENDIENTE, CONFIRMADO, PREPARADO, ENTREGADO, CANCELADO, RECHAZADO). Omitir para ver todos.',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_orders_by_status',
      description:
        'Lista el detalle de las solicitudes de pedido (código ORD, estado, productos solicitados, precios y notas) con datos personales anonimizados.',
      parameters: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            description:
              'Estado a filtrar (ej. PENDIENTE, CONFIRMADO, PREPARADO, ENTREGADO). Omitir para traer todos.',
          },
          limit: {
            type: 'number',
            description: 'Cantidad máxima de pedidos a devolver (por defecto 10).',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_catalog_stock_alerts',
      description:
        'Consulta el catálogo de productos para verificar precios vigentes, modalidades de venta (Unidad/Caja) y disponibilidad.',
      parameters: {
        type: 'object',
        properties: {
          search: {
            type: 'string',
            description: 'Término opcional para buscar por nombre de vino, licor o marca.',
          },
          category: {
            type: 'string',
            description: 'Categoría opcional para filtrar productos.',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_top_requested_products',
      description:
        'Calcula el ranking de vinos, licores y delicatessen más solicitados en los pedidos, sumando unidades pedidas y monto total acumulado por producto.',
      parameters: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Cantidad de productos del ranking a retornar (por defecto 5).',
          },
        },
      },
    },
  },
];

/**
 * Ejecutor de las 4 herramientas de solo lectura
 */
export function createAiToolsExecutor({ orderRepository }) {
  const catalogApiUrl = (
    process.env.CATALOG_API_URL ||
    process.env.NEXT_PUBLIC_CATALOG_API_URL ||
    'http://127.0.0.1:8000/api'
  ).replace(/\/+$/, '');

  return {
    async executeTool(toolName, rawArgs = {}) {
      const startTime = Date.now();
      const args = typeof rawArgs === 'string' ? JSON.parse(rawArgs || '{}') : rawArgs || {};

      if (toolName === 'get_orders_summary') {
        const allOrders = await orderRepository.obtenerTodos();
        const countsByStatus = {
          PENDIENTE: 0,
          CONFIRMADO: 0,
          PREPARADO: 0,
          ENTREGADO: 0,
          CANCELADO: 0,
          RECHAZADO: 0,
        };
        let totalActiveAmount = 0;

        for (const ord of allOrders) {
          const st = ord.status || 'PENDIENTE';
          countsByStatus[st] = (countsByStatus[st] || 0) + 1;
          if (st !== 'CANCELADO' && st !== 'RECHAZADO') {
            totalActiveAmount += Number(ord.totalAmount || 0);
          }
        }

        const filtered = args.status
          ? allOrders.filter((o) => o.status === String(args.status).toUpperCase())
          : allOrders;

        const sampleOrders = filtered.slice(0, 5).map(sanitizeOrderForLLM);

        return {
          durationMs: Date.now() - startTime,
          source: 'Pedidos',
          result: {
            totalOrders: allOrders.length,
            countsByStatus,
            totalActiveAmount,
            filteredCount: filtered.length,
            sampleOrders,
          },
        };
      }

      if (toolName === 'search_orders_by_status') {
        const statusFilter = args.status ? String(args.status).toUpperCase() : undefined;
        const limit = Number(args.limit) > 0 ? Math.min(Number(args.limit), 20) : 10;
        const orders = await orderRepository.obtenerTodos(
          statusFilter && statusFilter !== 'TODOS' ? { status: statusFilter } : {}
        );
        const sanitized = orders.slice(0, limit).map(sanitizeOrderForLLM);

        return {
          durationMs: Date.now() - startTime,
          source: 'Pedidos',
          result: {
            filterApplied: statusFilter || 'TODOS',
            count: sanitized.length,
            orders: sanitized,
          },
        };
      }

      if (toolName === 'get_top_requested_products') {
        const limit = Number(args.limit) > 0 ? Math.min(Number(args.limit), 15) : 5;
        const allOrders = await orderRepository.obtenerTodos();
        const map = new Map();

        for (const ord of allOrders) {
          if (ord.status === 'CANCELADO' || ord.status === 'RECHAZADO') continue;
          for (const item of ord.items || []) {
            const key = item.productName || `Prod-${item.productId}`;
            const current = map.get(key) || {
              productId: item.productId,
              productName: key,
              totalUnits: 0,
              totalRevenue: 0,
              ordersCount: 0,
            };
            current.totalUnits += Number(item.quantity || 0);
            current.totalRevenue += Number(item.subtotal || item.unitPrice * item.quantity || 0);
            current.ordersCount += 1;
            map.set(key, current);
          }
        }

        const ranking = Array.from(map.values())
          .sort((a, b) => b.totalUnits - a.totalUnits || b.totalRevenue - a.totalRevenue)
          .slice(0, limit);

        return {
          durationMs: Date.now() - startTime,
          source: 'Demanda',
          result: {
            topProducts: ranking,
          },
        };
      }

      if (toolName === 'get_catalog_stock_alerts') {
        try {
          const params = new URLSearchParams();
          if (args.search) params.set('search', String(args.search));
          if (args.category) params.set('category', String(args.category));
          const qs = params.toString();
          const res = await fetch(`${catalogApiUrl}/products/${qs ? `?${qs}` : ''}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.results || [];
          const mapped = list.slice(0, 12).map((p) => ({
            id: p.id,
            name: p.name,
            brand: p.brand?.name || 'Genérico',
            category: p.category?.name || 'General',
            saleModes: (p.sale_modes || []).map((m) => ({
              type: m.type,
              price: m.prices?.[0]?.amount ? Number(m.prices[0].amount) : 0,
            })),
          }));

          return {
            durationMs: Date.now() - startTime,
            source: 'Catálogo',
            result: {
              totalCatalogCount: typeof data.count === 'number' ? data.count : mapped.length,
              products: mapped,
            },
          };
        } catch {
          const allOrders = await orderRepository.obtenerTodos();
          const seen = new Map();
          for (const ord of allOrders) {
            for (const item of ord.items || []) {
              if (!seen.has(item.productName)) {
                seen.set(item.productName, {
                  id: item.productId,
                  name: item.productName,
                  referenceUnitPrice: item.unitPrice,
                });
              }
            }
          }
          return {
            durationMs: Date.now() - startTime,
            source: 'Catálogo',
            result: {
              note: 'Se listan los productos registrados en órdenes activas.',
              products: Array.from(seen.values()),
            },
          };
        }
      }

      throw new Error('Operación de consulta no soportada.');
    },
  };
}
