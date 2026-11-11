import React from 'react';
import SiteHeader from '@/widgets/site-header';
import SiteFooter from '@/widgets/site-footer';
import { CartUIProvider } from '@/features/cart/context/CartUIContext';
import CartDrawer from '@/features/cart/ui/CartDrawer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartUIProvider>
      <SiteHeader />
      <main id="main-content">
        {children}
      </main>
      <CartDrawer />
      <SiteFooter />
    </CartUIProvider>
  );
}
