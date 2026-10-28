'use client';
import React, { useState } from 'react';

interface Order {
  id: string;
  date: string;
  customerName: string;
  itemsCount: number;
  status: 'Pendiente' | 'En revisión' | 'Confirmado' | 'Preparado' | 'Completado' | 'Rechazado' | 'Cancelado';
  total: number;
}

const INITIAL_ORDERS: Order[] = [
  { id: '#ORD-9824', date: 'Hoy, 14:24', customerName: 'Alejandro Silva González', itemsCount: 3, status: 'Pendiente', total: 189.50 },
  { id: '#ORD-9823', date: 'Hoy, 13:10', customerName: 'María Teresa Ocampo', itemsCount: 1, status: 'En revisión', total: 45.00 },
  { id: '#ORD-9822', date: 'Hoy, 11:05', customerName: 'Javier Pérez Espinoza', itemsCount: 5, status: 'Confirmado', total: 412.99 },
  { id: '#ORD-9821', date: 'Ayer, 18:40', customerName: 'Isabel Gómez Ruiz', itemsCount: 2, status: 'Preparado', total: 114.20 },
  { id: '#ORD-9820', date: 'Ayer, 16:15', customerName: 'Fernando Martínez Santos', itemsCount: 4, status: 'Completado', total: 320.00 },
  { id: '#ORD-9819', date: '24 Oct, 12:30', customerName: 'Sofía Ramos Alarcón', itemsCount: 1, status: 'Rechazado', total: 89.90 },
  { id: '#ORD-9818', date: '24 Oct, 09:15', customerName: 'Lucía Fernández Castro', itemsCount: 2, status: 'Cancelado', total: 54.00 },
];

export default function AdminDashboardPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('#ORD-9823');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const selectedOrder = INITIAL_ORDERS.find(o => o.id === selectedOrderId) || INITIAL_ORDERS[1];

  const filteredOrders = INITIAL_ORDERS.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'Todos' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Pendiente': return 'badge-pendiente';
      case 'En revisión': return 'badge-revision';
      case 'Confirmado': return 'badge-confirmado';
      case 'Preparado': return 'badge-preparado';
      case 'Completado': return 'badge-completado';
      case 'Rechazado': return 'badge-rechazado';
      case 'Cancelado': return 'badge-cancelado';
      default: return '';
    }
  };

  return (
    <div>
      {/* Header Superior */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem', fontFamily: 'Inter, sans-serif' }}>
            Gestión de Pedidos
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Monitorea, filtra y actualiza el estado de las órdenes en tiempo real.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary-white">Exportar CSV</button>
          <button className="btn-primary-blue">+ Nuevo Pedido</button>
        </div>
      </div>

      {/* Tarjetas Métricas KPI */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span>Pedidos de hoy</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          <div className="kpi-value">142</div>
          <div className="kpi-trend trend-up">+12.4% vs. ayer</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>Por confirmar</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <div className="kpi-value">18</div>
          <div className="kpi-trend trend-down">-4.1% vs. ayer</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>En preparación</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
          </div>
          <div className="kpi-value">29</div>
          <div className="kpi-trend trend-up">+8.3% vs. ayer</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>Completados</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div className="kpi-value">95</div>
          <div className="kpi-trend trend-up">+15.2% vs. ayer</div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros de Estado */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.6rem 0.9rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{ marginRight: '0.5rem' }}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Buscar por ID de pedido, cliente o SKU..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', color: '#0f172a' }}
            />
          </div>
          <button className="btn-secondary-white" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Últimos 7 días ⌄
          </button>
        </div>

        <div className="status-tabs">
          {[
            { label: 'Todos', count: 245 },
            { label: 'Pendientes', count: 12 },
            { label: 'En revisión', count: 6 },
            { label: 'Confirmados', count: 43 },
            { label: 'Preparados', count: 29 },
            { label: 'Completados', count: 135 },
            { label: 'Rechazados', count: 14 },
            { label: 'Cancelados', count: 6 }
          ].map((tab) => (
            <button
              key={tab.label}
              onClick={() => setSelectedStatus(tab.label)}
              className={`tab-pill ${selectedStatus === tab.label ? 'active' : 'inactive'}`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Grid Principal: Tabla de Pedidos a la Izquierda y Detalle a la Derecha */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
        
        {/* Tabla de Pedidos */}
        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID / Fecha</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    No hay pedidos con el estado o filtro seleccionado.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isSelected = order.id === selectedOrderId;
                  return (
                    <tr 
                      key={order.id} 
                      onClick={() => setSelectedOrderId(order.id)}
                      style={{ 
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#f1f5f9' : 'transparent',
                        borderLeft: isSelected ? '4px solid #2563eb' : '4px solid transparent'
                      }}
                    >
                      <td>
                        <div style={{ fontWeight: 700, color: '#2563eb' }}>{order.id}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.date}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{order.customerName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.itemsCount} {order.itemsCount === 1 ? 'producto' : 'productos'}</div>
                      </td>
                      <td>
                        <span className={`badge-status ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                        {order.total.toFixed(2).replace('.', ',')} $
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderTop: '1px solid #e2e8f0', background: '#ffffff', fontSize: '0.85rem', color: '#64748b' }}>
            <span>Mostrando 1 a 7 de 245 pedidos</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-secondary-white" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>Anterior</button>
              <button className="btn-primary-blue" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>Siguiente</button>
            </div>
          </div>
        </div>

        {/* Panel Lateral: Detalle del Pedido Seleccionado */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>
                Detalle de Pedido <span style={{ color: '#2563eb' }}>{selectedOrder.id}</span>
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Fecha de creación: {selectedOrder.date}</p>
            </div>
            <span className={`badge-status ${getStatusBadgeClass(selectedOrder.status)}`}>
              {selectedOrder.status}
            </span>
          </div>

          {/* Stepper: Flujo del Pedido */}
          <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Flujo del Pedido</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#16a34a', marginTop: '4px', flexShrink: 0 }}></div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>Pedido Recibido</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Completado hoy, 13:10 PM</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#2563eb', marginTop: '4px', flexShrink: 0 }}></div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>En Revisión</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>En proceso por el agente administrador</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #cbd5e1', background: '#ffffff', marginTop: '4px', flexShrink: 0 }}></div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#64748b' }}>Preparación en Almacén</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Pendiente de confirmación de pago</div>
                </div>
              </div>
            </div>
          </div>

          {/* Información del Cliente */}
          <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Información del Cliente</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.4rem 1rem', fontSize: '0.85rem' }}>
              <span style={{ color: '#64748b' }}>Cliente:</span>
              <span style={{ fontWeight: 600, color: '#0f172a', textAlign: 'right' }}>{selectedOrder.customerName}</span>
              
              <span style={{ color: '#64748b' }}>Correo:</span>
              <span style={{ color: '#0f172a', textAlign: 'right' }}>m.ocampo@gmail.com</span>
              
              <span style={{ color: '#64748b' }}>Teléfono:</span>
              <span style={{ color: '#0f172a', textAlign: 'right' }}>+34 612 345 678</span>
              
              <span style={{ color: '#64748b' }}>Dirección:</span>
              <span style={{ color: '#0f172a', textAlign: 'right' }}>Calle de Alcalá 45, Piso 3B, 28014 Madrid</span>
            </div>
          </div>

          {/* Resumen Económico */}
          <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', color: '#64748b' }}>
              <span>Subtotal</span>
              <span>{(selectedOrder.total * 0.826).toFixed(2).replace('.', ',')} $</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', color: '#64748b' }}>
              <span>IVA (21%)</span>
              <span>{(selectedOrder.total * 0.174).toFixed(2).replace('.', ',')} $</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#64748b' }}>
              <span>Gastos de Envío</span>
              <span style={{ color: '#16a34a', fontWeight: 600 }}>Gratis</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px dashed #e2e8f0', fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
              <span>Total del Pedido</span>
              <span>{selectedOrder.total.toFixed(2).replace('.', ',')} $</span>
            </div>
          </div>

          {/* Señalar / Cambiar Estado del Pedido */}
          <div>
            <h4 style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Señalar / Cambiar estado del pedido
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              <button className="badge-status badge-pendiente" style={{ justifyContent: 'center', cursor: 'pointer', border: '1px solid #f59e0b' }}>● Pendiente</button>
              <button className="badge-status badge-revision" style={{ justifyContent: 'center', cursor: 'pointer', border: '1px solid #a855f7' }}>● Revisión</button>
              <button className="badge-status badge-confirmado" style={{ justifyContent: 'center', cursor: 'pointer', border: '1px solid #3b82f6' }}>● Confirmar</button>
              <button className="badge-status badge-preparado" style={{ justifyContent: 'center', cursor: 'pointer', border: '1px solid #14b8a6' }}>● Preparado</button>
              <button className="badge-status badge-completado" style={{ justifyContent: 'center', cursor: 'pointer', border: '1px solid #22c55e', gridColumn: 'span 2' }}>● Completado</button>
              <button className="badge-status badge-rechazado" style={{ justifyContent: 'center', cursor: 'pointer', border: '1px solid #ef4444' }}>● Rechazar</button>
              <button className="badge-status badge-cancelado" style={{ justifyContent: 'center', cursor: 'pointer', border: '1px solid #94a3b8', gridColumn: 'span 2' }}>● Cancelar</button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

