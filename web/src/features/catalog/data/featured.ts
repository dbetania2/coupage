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
    id: '1',
    name: 'Rutini Cabernet Malbec',
    subtitle: 'COSECHA 2020',
    price: 12500.00,
    badge: 'EDICIÓN VINTAGE',
    category: 'Vinos de Autor',
    image: 'https://images.unsplash.com/photo-1586370434639-0fe43b2d32e6?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '2',
    name: 'Catena Zapata Malbec Argentino',
    subtitle: 'COSECHA HISTÓRICA',
    price: 115000.00,
    badge: 'CRAFT SELECTION',
    category: 'Vinos de Autor',
    image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '3',
    name: 'Zuccardi Aluvional Gualtallary',
    subtitle: 'VALLE DE UCO',
    price: 145000.00,
    badge: 'EDICIÓN LIMITADA',
    category: 'Vinos de Autor',
    image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '5',
    name: 'Añejo Reserva Manchego D.O.',
    subtitle: 'CURACIÓN 12 MESES EN CUEVA',
    price: 25000.00,
    badge: 'AFINADO EN CUEVA',
    category: 'Delicatessen',
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?q=80&w=800&auto=format&fit=crop',
  },
];

