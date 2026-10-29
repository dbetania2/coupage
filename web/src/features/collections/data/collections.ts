export interface Collection {
  id: string;
  title: string;
  badge: string;
  image: string;
  actionText: string;
}

export const AUTHOR_COLLECTIONS: Collection[] = [
  {
    id: 'col-1',
    title: 'Bodega de Autor',
    badge: 'GRANDES RESERVAS',
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=800&auto=format&fit=crop',
    actionText: 'EXPLORAR COLECCIÓN',
  },
  {
    id: 'col-2',
    title: 'Joyas de la Tierra',
    badge: 'AFINADOS & CURADOS',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop',
    actionText: 'EXPLORAR COLECCIÓN',
  },
  {
    id: 'col-3',
    title: 'Cajas del Coleccionista',
    badge: 'EDICIÓN ANUAL',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
    actionText: 'EXPLORAR COLECCIÓN',
  },
];

