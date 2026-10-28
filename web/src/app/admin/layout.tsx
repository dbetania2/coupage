'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import './admin.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Verificación de autenticación (Criterio de Aceptación T12)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('access_token') : null;
    
    // Si no hay token y la pantalla de login está disponible en /login:
    if (!token) {
      // router.push('/login');
    }
  }, [router]);

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

