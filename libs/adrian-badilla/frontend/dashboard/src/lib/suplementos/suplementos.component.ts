import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ProductCardsSectionComponent } from '../product-cards-section/product-cards-section.component';
import { SUPPLEMENTS_MOCK } from '../mock/products/products.mock';

@Component({
  selector: 'lib-suplementos',
  standalone: true,
  imports: [ProductCardsSectionComponent],
  template: `<lib-product-cards-section title="Suplementos" [products]="products" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuplementosComponent {
  readonly products = SUPPLEMENTS_MOCK;
}
