import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-products',
  imports: [],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsComponent {}
