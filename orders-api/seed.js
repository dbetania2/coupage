import { db, admin } from './src/config/firebase.js';

async function seedDatabase() {
  console.log('🌱 Inicializando colección "orders" con 5 pedidos de prueba en Firebase Firestore...\n');

  try {
    const orders = [
      {
        orderNumber: 'ORD-2026-0001',
        customer: {
          name: 'Agustín Del Grecco',
          email: 'agustin@coupage.com',
          phone: '+54 9 11 4455-6677',
          shippingAddress: 'Av. Libertador 2450, Palermo, CABA'
        },
        items: [
          {
            productId: 1,
            saleModeId: 1,
            productName: 'Rutini Cabernet Malbec',
            unitPrice: 18500.00,
            quantity: 2,
            subtotal: 37000.00
          }
        ],
        totalAmount: 37000.00,
        status: 'PENDIENTE',
        history: [
          {
            status: 'PENDIENTE',
            timestamp: new Date(Date.now() - 3600000 * 4), // Hace 4 horas
            note: 'Solicitud de pedido recibida en el checkout'
          }
        ],
        createdAt: new Date(Date.now() - 3600000 * 4),
        updatedAt: new Date(Date.now() - 3600000 * 4)
      },
      {
        orderNumber: 'ORD-2026-0002',
        customer: {
          name: 'Daiana Satina',
          email: 'daiana@coupage.com',
          phone: '+54 9 11 5566-7788',
          shippingAddress: 'Calle Belgrano 890, Mendoza Capital'
        },
        items: [
          {
            productId: 2,
            saleModeId: 1,
            productName: 'Catena Zapata Malbec Argentino',
            unitPrice: 52000.00,
            quantity: 1,
            subtotal: 52000.00
          },
          {
            productId: 5,
            saleModeId: 1,
            productName: 'Queso Manchego Curado Añejo',
            unitPrice: 24000.00,
            quantity: 1,
            subtotal: 24000.00
          }
        ],
        totalAmount: 76000.00,
        status: 'CONFIRMADO',
        history: [
          {
            status: 'PENDIENTE',
            timestamp: new Date(Date.now() - 3600000 * 12),
            note: 'Solicitud de compra iniciada'
          },
          {
            status: 'CONFIRMADO',
            timestamp: new Date(Date.now() - 3600000 * 10),
            note: 'Pago verificado exitosamente y stock reservado'
          }
        ],
        createdAt: new Date(Date.now() - 3600000 * 12),
        updatedAt: new Date(Date.now() - 3600000 * 10)
      },
      {
        orderNumber: 'ORD-2026-0003',
        customer: {
          name: 'Santiago Gallardi',
          email: 'santiago@coupage.com',
          phone: '+54 9 341 667-8899',
          shippingAddress: 'Bv. Oroño 1420, Rosario, Santa Fe'
        },
        items: [
          {
            productId: 3,
            saleModeId: 2,
            productName: 'Zuccardi Aluvional Gualtallary (Caja x6)',
            unitPrice: 210000.00,
            quantity: 1,
            subtotal: 210000.00
          }
        ],
        totalAmount: 210000.00,
        status: 'PREPARADO',
        history: [
          {
            status: 'PENDIENTE',
            timestamp: new Date(Date.now() - 3600000 * 24),
            note: 'Solicitud creada en plataforma'
          },
          {
            status: 'CONFIRMADO',
            timestamp: new Date(Date.now() - 3600000 * 22),
            note: 'Transferencia bancaria validada'
          },
          {
            status: 'PREPARADO',
            timestamp: new Date(Date.now() - 3600000 * 18),
            note: 'Caja embalada y rotulada para despacho'
          }
        ],
        createdAt: new Date(Date.now() - 3600000 * 24),
        updatedAt: new Date(Date.now() - 3600000 * 18)
      },
      {
        orderNumber: 'ORD-2026-0004',
        customer: {
          name: 'Lucía Fernández',
          email: 'lucia.fernandez@example.com',
          phone: '+54 9 11 3322-1100',
          shippingAddress: 'San Martín 450, San Isidro, Buenos Aires'
        },
        items: [
          {
            productId: 4,
            saleModeId: 1,
            productName: 'Johnnie Walker Blue Label',
            unitPrice: 320000.00,
            quantity: 1,
            subtotal: 320000.00
          }
        ],
        totalAmount: 320000.00,
        status: 'ENTREGADO',
        history: [
          {
            status: 'PENDIENTE',
            timestamp: new Date(Date.now() - 3600000 * 72),
            note: 'Pedido registrado'
          },
          {
            status: 'CONFIRMADO',
            timestamp: new Date(Date.now() - 3600000 * 70),
            note: 'Pago con tarjeta aprobado'
          },
          {
            status: 'PREPARADO',
            timestamp: new Date(Date.now() - 3600000 * 60),
            note: 'Embalado y despachado por correo privado'
          },
          {
            status: 'ENTREGADO',
            timestamp: new Date(Date.now() - 3600000 * 24),
            note: 'Entregado al cliente con firma de conformidad'
          }
        ],
        createdAt: new Date(Date.now() - 3600000 * 72),
        updatedAt: new Date(Date.now() - 3600000 * 24)
      },
      {
        orderNumber: 'ORD-2026-0005',
        customer: {
          name: 'Martín Gómez',
          email: 'martin.gomez@example.com',
          phone: '+54 9 11 9988-7766',
          shippingAddress: 'Av. Corrientes 3200, Abasto, CABA'
        },
        items: [
          {
            productId: 1,
            saleModeId: 1,
            productName: 'Rutini Cabernet Malbec',
            unitPrice: 18500.00,
            quantity: 3,
            subtotal: 55500.00
          }
        ],
        totalAmount: 55500.00,
        status: 'CANCELADO',
        history: [
          {
            status: 'PENDIENTE',
            timestamp: new Date(Date.now() - 3600000 * 48),
            note: 'Orden creada pendiente de pago'
          },
          {
            status: 'CANCELADO',
            timestamp: new Date(Date.now() - 3600000 * 47),
            note: 'Cancelada por el cliente por error en la dirección'
          }
        ],
        createdAt: new Date(Date.now() - 3600000 * 48),
        updatedAt: new Date(Date.now() - 3600000 * 47)
      }
    ];

    for (const order of orders) {
      // Revisa si ya existe para no duplicar
      const snapshot = await db.collection('orders')
        .where('orderNumber', '==', order.orderNumber)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        console.log(`ℹ️ [${order.status}] Pedido ${order.orderNumber} ya existe -> ID: ${snapshot.docs[0].id}`);
        continue;
      }

      // Inserta con ID aleatorio de Firebase
      const docRef = await db.collection('orders').add(order);
      console.log(`✅ [${order.status}] Pedido ${order.orderNumber} cargado -> ID: ${docRef.id}`);
    }

    console.log('\n🎉 ¡Los 5 pedidos con todos sus estados fueron creados con éxito en Firestore!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al insertar pedidos en Firebase:', error.message);
    process.exit(1);
  }
}

seedDatabase();
