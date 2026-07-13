import type { CatalogItem } from './catalog.types';

export type ContraindicationSeverityId = 'allow' | 'caution' | 'avoid';

export const CONTRAINDICATION_SEVERITY_CATALOG: CatalogItem<ContraindicationSeverityId>[] =
  [
    { id: 'allow', label: 'Permitido' },
    { id: 'caution', label: 'Precaución' },
    { id: 'avoid', label: 'Evitar' },
  ];
