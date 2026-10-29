import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tu Gusto Gourmet | Obras de Autor Embotelladas y Curadas',
  description: 'Vinos de autor, quesos afinados bajo guarda y piezas exclusivas curadas para paladares gastronómicos exigentes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
