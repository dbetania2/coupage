'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import '../admin.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Verificación de autenticación (Criterio de Aceptación T12)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('access_token') : null;
    
    // Si no hay token, redirigir inmediatamente a la pantalla de login limpia
    if (!token) {
      router.replace('/admin/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  // Si no está autorizado aún, no renderizar el panel ni el sidebar para evitar flash visual
  if (!isAuthorized) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a', color: '#c5a059' }}>
        <p style={{ letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.85rem' }}>Verificando credenciales...</p>
      </div>
    );
  }

  return (
    <div className="admin-layout-container">
      {/* Sidebar fijo a la izquierda según diseño Figma */}
      <AdminSidebar />
      
      {/* Contenido dinámico de las páginas administrativas */}
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}

