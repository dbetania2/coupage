export interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  badge?: string;
  category: string;
  image: string;
}

export const FEATURED_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Vega Sicilia Único',
    subtitle: 'COSECHA 2012',
    price: 450.00,
    badge: 'EDICIÓN VINTAGE',
    category: 'Vinos de Autor',
    image: 'https://images.unsplash.com/photo-1586370434639-0fe43b2d32e6?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'prod-2',
    name: 'Jamón de Bellota 100% Ibérico',
    subtitle: 'CORTADO A CUCHILLO - 80G',
    price: 38.50,
    badge: 'CRAFT SELECTION',
    category: 'Charcutería Selecta',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'prod-3',
    name: 'Aceite Trufa Blanca & Huerto',
    subtitle: 'RESERVA FAMILIAR 250ML',
    price: 42.00,
    badge: 'EDICIÓN LIMITADA',
    category: 'Atelier Gourmet',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'prod-4',
    name: 'Añejo Reserva Manchego D.O.',
    subtitle: 'CURACIÓN 24 MESES EN CUEVA',
    price: 29.50,
    badge: 'AFINADO EN CUEVA',
    category: 'Quesos de Autor',
    image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?q=80&w=800&auto=format&fit=crop',
  },
];

