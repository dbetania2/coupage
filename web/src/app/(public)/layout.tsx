import React from 'react';
import SiteHeader from '@/widgets/site-header';
import SiteFooter from '@/widgets/site-footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}

