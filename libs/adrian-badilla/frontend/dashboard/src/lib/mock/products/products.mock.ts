export interface ProductMock {
  id: string;
  name: string;
  category: 'accesorio' | 'suplemento';
  description: string;
  price: number;
  imageUrl: string;
  badge?: string;
  variants?: string[]; // thumbnail image URLs for color/variant swatches
}

export const ACCESSORIES_MOCK: ProductMock[] = [
  {
    id: 'acc-01',
    name: 'Guantes de Entrenamiento',
    category: 'accesorio',
    description: 'Guantes con palm grip reforzado, ideales para pesos libres y barra.',
    price: 24.99,
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80',
    badge: 'Más vendido',
    variants: [
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=80&q=70',
      'https://images.unsplash.com/photo-1552821206-6a2b651b832a?w=80&q=70',
    ],
  },
  {
    id: 'acc-02',
    name: 'Banda Elástica Resistencia Alta',
    category: 'accesorio',
    description: 'Set de bandas de resistencia para activación muscular y movilidad.',
    price: 18.50,
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
    variants: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=80&q=70',
    ],
  },
  {
    id: 'acc-03',
    name: 'Cinturón Lumbar Power',
    category: 'accesorio',
    description: 'Soporte lumbar de cuero reforzado para sentadillas y peso muerto.',
    price: 54.00,
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
    badge: 'Nuevo',
    variants: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=80&q=70',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=80&q=70',
    ],
  },
  {
    id: 'acc-04',
    name: 'Rodilleras Compresión',
    category: 'accesorio',
    description: 'Rodilleras de compresión para estabilidad articular en squats pesados.',
    price: 32.00,
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
    variants: [
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=80&q=70',
    ],
  },
  {
    id: 'acc-05',
    name: 'Grip Wrist Wraps',
    category: 'accesorio',
    description: 'Muñequeras con sistema de agarre doble para press banca y jalas.',
    price: 15.99,
    imageUrl: 'https://images.unsplash.com/photo-1526506118085-0a8bc5bae512?w=600&q=80',
    variants: [
      'https://images.unsplash.com/photo-1526506118085-0a8bc5bae512?w=80&q=70',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=80&q=70',
    ],
  },
  {
    id: 'acc-06',
    name: 'Botella Shaker Pro',
    category: 'accesorio',
    description: 'Shaker de 900ml con compartimento para suplementos y mezclador interno.',
    price: 12.99,
    imageUrl: 'https://images.unsplash.com/photo-1523438097911-512ad516aef3?w=600&q=80',
  },
];

export const SUPPLEMENTS_MOCK: ProductMock[] = [
  {
    id: 'sup-01',
    name: 'Whey Protein Gold 2.27kg',
    category: 'suplemento',
    description: 'Proteína de suero de alta absorción, 25g de proteína por scoop. Sabor chocolate.',
    price: 89.99,
    imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80',
    badge: 'Top ventas',
    variants: [
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=80&q=70',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=80&q=70',
    ],
  },
  {
    id: 'sup-02',
    name: 'Creatina Monohidrato 500g',
    category: 'suplemento',
    description: 'Creatina pura micronizada, mejora fuerza y rendimiento anaeróbico.',
    price: 34.50,
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80',
    variants: [
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=80&q=70',
    ],
  },
  {
    id: 'sup-03',
    name: 'Pre-Workout Extreme',
    category: 'suplemento',
    description: 'Fórmula de pre-entreno con cafeína, beta-alanina y citrulina. Energía máxima.',
    price: 49.00,
    imageUrl: 'https://images.unsplash.com/photo-1526506118085-0a8bc5bae512?w=600&q=80',
    badge: 'Nuevo',
    variants: [
      'https://images.unsplash.com/photo-1526506118085-0a8bc5bae512?w=80&q=70',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=80&q=70',
    ],
  },
  {
    id: 'sup-04',
    name: 'BCAA Aminoácidos 300g',
    category: 'suplemento',
    description: 'Aminoácidos de cadena ramificada 2:1:1. Recuperación muscular acelerada.',
    price: 28.00,
    imageUrl: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=600&q=80',
    variants: [
      'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=80&q=70',
    ],
  },
  {
    id: 'sup-05',
    name: 'Omega 3 Fish Oil 120 caps',
    category: 'suplemento',
    description: 'Aceite de pescado de alta pureza, reduce inflamación y protege articulaciones.',
    price: 22.99,
    imageUrl: 'https://images.unsplash.com/photo-1552821206-6a2b651b832a?w=600&q=80',
    variants: [
      'https://images.unsplash.com/photo-1552821206-6a2b651b832a?w=80&q=70',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=80&q=70',
    ],
  },
  {
    id: 'sup-06',
    name: 'Multivitamínico Sport',
    category: 'suplemento',
    description: 'Complejo de vitaminas y minerales formulado para atletas de alto rendimiento.',
    price: 19.99,
    imageUrl: 'https://images.unsplash.com/photo-1523438097911-512ad516aef3?w=600&q=80',
    variants: [
      'https://images.unsplash.com/photo-1523438097911-512ad516aef3?w=80&q=70',
    ],
  },
];
