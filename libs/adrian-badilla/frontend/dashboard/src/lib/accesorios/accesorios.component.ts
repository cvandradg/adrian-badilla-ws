import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ProductCardsSectionComponent } from '../product-cards-section/product-cards-section.component';
import { ACCESSORIES_MOCK } from '../mock/products/products.mock';

@Component({
  selector: 'lib-accesorios',
  standalone: true,
  imports: [ProductCardsSectionComponent],
  template: `<lib-product-cards-section title="Accesorios" [products]="products" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccesoriosComponent {
  readonly products = ACCESSORIES_MOCK;
}
