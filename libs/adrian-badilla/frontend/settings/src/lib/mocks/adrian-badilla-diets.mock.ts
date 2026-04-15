import type {
  RouteNavItem,
  RouteSupercenterItem,
} from '../types/diets.types';

export const MOCK_ROUTES: RouteNavItem[] = [
  { id: '1', name: 'Lunes', description: '6 de Abril 2026' },
  { id: '2', name: 'Martes', description: '7 de Abril 2026' },
  { id: '3', name: 'Miercoles', description: '8 de Abril 2026' },
  { id: '4', name: 'Jueves', description: '9 de Abril 2026' },
  { id: '5', name: 'Viernes', description: '10 de Abril 2026' },
  { id: '6', name: 'Sabado', description: '11 de Abril 2026' },
  { id: '7', name: 'Domingo', description: '12 de Abril 2026' },
];

const ROUTE_1_SUPERCENTERS: RouteSupercenterItem[] = [
  {
    id: '1',
    name: 'DESAYUNO',
    route: '1',
    province: 'Alajuela',
    estimateLocation: 'Avena con Leche o bebida Vegetal',
    exactLocation: 'Oat',
    lastModifiedLabel: '6/4/26, 7:00 a. m.',
    imgPrimeng: 'pi pi-sun',
    status: 'pending',
  },
  {
    id: '2',
    name: 'Snack de la mañana',
    route: '1',
    province: 'Heredia',
    estimateLocation: 'Yogurt narutal o griego, nueces o almendras',
    exactLocation: 'Natural Yogurt',
    lastModifiedLabel: '6/4/26, 10:00 a. m.',
    imgPrimeng: 'pi pi-heart',
    status: 'pending',

  },
  {
    id: '3',
    name: 'ALMUERZO',
    route: '1',
    province: 'Heredia',
    estimateLocation: 'Pollo, pescado o carne magra con arroz integral y aguacate',
    exactLocation: 'Chicken Breast',
    lastModifiedLabel: '6/4/26, 1:00 p. m.',
    imgPrimeng: 'pi pi-briefcase',
    status: 'pending',

  },
  {
    id: '4',
    name: 'Snack Tarde',
    route: '1',
    province: 'Snack Tarde',
    estimateLocation: '1 Fruta, tostada integral con mantequilla de mani',
    exactLocation: 'whole wheat toast with peanut butter',
    lastModifiedLabel: '6/4/26, 4:00 p. m.',
    imgPrimeng: 'pi pi-sparkles',
    status: 'pending',

  },
  {
    id: '5',
    name: 'CENA',
    route: '1',
    province: 'Heredia',
    estimateLocation: 'Proteina ligera: pollo, atun o huevo, Vegetales cocidos',
    exactLocation: 'Tuna',
    lastModifiedLabel: '6/4/26, 7:00 p. m.',
    imgPrimeng: 'pi pi-moon',
    status: 'pending',

  },
  {
    id: '6',
    name: 'Snack Opcional(si tienes hambre)',
    route: '1',
    province: 'Heredia',
    estimateLocation: 'Yogurt o vaso de leche o un punado de pequeno de frutos secos',
    exactLocation: 'Dried Fruits',
    lastModifiedLabel: '6/4/26, 9:00 p. m.',
    imgPrimeng: 'pi pi-clock',
    status: 'pending',

  },
];

const ROUTE_2_SUPERCENTERS: RouteSupercenterItem[] = [
  {
    id: '201',
    name: 'DESAYUNO',
    route: '2',
    province: 'Cartago',
    estimateLocation: 'Huevos revueltos con tortilla integral y cafe',
    exactLocation: 'Scrambled eggs with whole wheat tortilla',
    lastModifiedLabel: '7/4/26, 7:00 a. m.',
    imgPrimeng: 'pi pi-sun',
    status: 'pending',

  },
  {
    id: '202',
    name: 'Snack de la manana',
    route: '2',
    province: 'Cartago',
    estimateLocation: 'Manzana verde con mantequilla de mani',
    exactLocation: 'Green apple with peanut butter',
    lastModifiedLabel: '7/4/26, 10:00 a. m.',
    imgPrimeng: 'pi pi-heart',
    status: 'pending',

  },
  {
    id: '203',
    name: 'ALMUERZO',
    route: '2',
    province: 'San Jose',
    estimateLocation: 'Salmon a la plancha con pure de camote y ensalada verde',
    exactLocation: 'Grilled salmon with sweet potato mash',
    lastModifiedLabel: '7/4/26, 1:00 p. m.',
    imgPrimeng: 'pi pi-briefcase',
    status: 'pending',

  },
  {
    id: '204',
    name: 'Snack Tarde',
    route: '2',
    province: 'San Jose',
    estimateLocation: 'Batido de proteina con banano y leche de almendra',
    exactLocation: 'Protein shake with banana',
    lastModifiedLabel: '7/4/26, 4:00 p. m.',
    imgPrimeng: 'pi pi-sparkles',
    status: 'pending',

  },
  {
    id: '205',
    name: 'CENA',
    route: '2',
    province: 'Heredia',
    estimateLocation: 'Pechuga de pollo con vegetales al vapor y quinoa',
    exactLocation: 'Chicken breast with steamed vegetables',
    lastModifiedLabel: '7/4/26, 7:00 p. m.',
    imgPrimeng: 'pi pi-moon',
    status: 'pending',

  },
  {
    id: '206',
    name: 'Snack Nocturno',
    route: '2',
    province: 'Heredia',
    estimateLocation: 'Yogurt griego con chispas de cacao',
    exactLocation: 'Greek yogurt with cacao nibs',
    lastModifiedLabel: '7/4/26, 9:00 p. m.',
    imgPrimeng: 'pi pi-clock',
    status: 'pending',

  },
];

const ROUTE_4_SUPERCENTERS: RouteSupercenterItem[] = [
  {
    id: '401',
    name: 'DESAYUNO',
    route: '4',
    province: 'Alajuela',
    estimateLocation: 'Overnight oats con chia, fresa y semillas',
    exactLocation: 'Overnight oats with chia and strawberries',
    lastModifiedLabel: '9/4/26, 7:00 a. m.',
    imgPrimeng: 'pi pi-sun',
    status: 'pending',

  },
  {
    id: '402',
    name: 'Snack de la manana',
    route: '4',
    province: 'Alajuela',
    estimateLocation: 'Palitos de zanahoria con hummus',
    exactLocation: 'Carrot sticks with hummus',
    lastModifiedLabel: '9/4/26, 10:00 a. m.',
    imgPrimeng: 'pi pi-heart',
    status: 'pending',

  },
  {
    id: '403',
    name: 'ALMUERZO',
    route: '4',
    province: 'Puntarenas',
    estimateLocation: 'Arroz integral con atun, aguacate y pico de gallo',
    exactLocation: 'Brown rice with tuna and avocado',
    lastModifiedLabel: '9/4/26, 1:00 p. m.',
    imgPrimeng: 'pi pi-briefcase',
    status: 'pending',

  },
  {
    id: '404',
    name: 'Snack Tarde',
    route: '4',
    province: 'Puntarenas',
    estimateLocation: 'Galletas de arroz con queso cottage',
    exactLocation: 'Rice cakes with cottage cheese',
    lastModifiedLabel: '9/4/26, 4:00 p. m.',
    imgPrimeng: 'pi pi-sparkles',
    status: 'pending',

  },
  {
    id: '405',
    name: 'CENA',
    route: '4',
    province: 'Guanacaste',
    estimateLocation: 'Sopa de lentejas con huevo duro y ensalada',
    exactLocation: 'Lentil soup with boiled egg',
    lastModifiedLabel: '9/4/26, 7:00 p. m.',
    imgPrimeng: 'pi pi-moon',
    status: 'pending',

  },
  {
    id: '406',
    name: 'Snack Opcional',
    route: '4',
    province: 'Guanacaste',
    estimateLocation: 'Kiwi y un punado de almendras',
    exactLocation: 'Kiwi with almonds',
    lastModifiedLabel: '9/4/26, 9:00 p. m.',
    imgPrimeng: 'pi pi-clock',
    status: 'pending',

  },
];

export const MOCK_ROUTE_SUPERCENTERS_BY_ROUTE_ID: Record<string, RouteSupercenterItem[]> = {
  '1': ROUTE_1_SUPERCENTERS,
  '2': ROUTE_2_SUPERCENTERS,
  '4': ROUTE_4_SUPERCENTERS,
};

export function getMockRouteSupercenters(
  routeId: string,
): RouteSupercenterItem[] {
  return [...(MOCK_ROUTE_SUPERCENTERS_BY_ROUTE_ID[routeId] ?? [])];
}