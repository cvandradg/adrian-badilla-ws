import type { CatalogItem } from './catalog.types';

export type EquipmentId =
  | 'barbell'
  | 'dumbbells'
  | 'kettlebell'
  | 'cable_machine'
  | 'resistance_band'
  | 'pullup_bar'
  | 'bench'
  | 'squat_rack'
  | 'smith_machine'
  | 'trx'
  | 'medicine_ball'
  | 'foam_roller'
  | 'mat'
  | 'box'
  | 'rings'
  | 'treadmill'
  | 'bike'
  | 'rowing_machine'
  | 'bodyweight';

export const EQUIPMENT_CATALOG: CatalogItem<EquipmentId>[] = [
  { id: 'barbell', label: 'Barra' },
  { id: 'dumbbells', label: 'Mancuernas' },
  { id: 'kettlebell', label: 'Kettlebell' },
  { id: 'cable_machine', label: 'Máquina de cables' },
  { id: 'resistance_band', label: 'Banda elástica' },
  { id: 'pullup_bar', label: 'Barra de dominadas' },
  { id: 'bench', label: 'Banco' },
  { id: 'squat_rack', label: 'Rack de sentadilla' },
  { id: 'smith_machine', label: 'Smith Machine' },
  { id: 'trx', label: 'TRX / Suspensión' },
  { id: 'medicine_ball', label: 'Balón medicinal' },
  { id: 'foam_roller', label: 'Rodillo de espuma' },
  { id: 'mat', label: 'Colchoneta' },
  { id: 'box', label: 'Cajón pliométrico' },
  { id: 'rings', label: 'Anillas' },
  { id: 'treadmill', label: 'Caminadora' },
  { id: 'bike', label: 'Bicicleta' },
  { id: 'rowing_machine', label: 'Remo' },
  { id: 'bodyweight', label: 'Peso corporal' },
];
