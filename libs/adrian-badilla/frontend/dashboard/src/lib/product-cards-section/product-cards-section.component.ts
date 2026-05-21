import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { CurrencyPipe, TitleCasePipe } from '@angular/common';
import type { ProductMock } from '../mock/products/products.mock';

@Component({
  selector: 'lib-product-cards-section',
  standalone: true,
  imports: [CurrencyPipe, TitleCasePipe],
  templateUrl: './product-cards-section.component.html',
  styleUrl: './product-cards-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardsSectionComponent {
  readonly title = input.required<string>();
  readonly products = input.required<ProductMock[]>();

  /** productId → selected variant index */
  readonly #variantIndex = signal<Record<string, number>>({});
  /** productId → added state */
  readonly addedToCart = signal<Set<string>>(new Set());

  activeVariantIndex(productId: string): number {
    return this.#variantIndex()[productId] ?? 0;
  }

  activeImage(productId: string): string {
    const product = this.products().find((p) => p.id === productId);
    if (!product) return '';
    const idx = this.activeVariantIndex(productId);
    const raw = product.variants?.[idx] ?? product.imageUrl;
    // Upscale Unsplash thumbnail URLs used as variant swatches
    return raw.replace(/w=\d+/, 'w=600').replace(/q=\d+/, 'q=85');
  }

  selectVariant(productId: string, index: number): void {
    this.#variantIndex.update((map) => ({ ...map, [productId]: index }));
  }

  onAddToCart(event: MouseEvent, productId: string): void {
    event.stopPropagation();
    this.addedToCart.update((set) => {
      const next = new Set(set);
      next.add(productId);
      return next;
    });

    setTimeout(() => {
      this.addedToCart.update((set) => {
        const next = new Set(set);
        next.delete(productId);
        return next;
      });
    }, 2000);
  }

  isAdded(productId: string): boolean {
    return this.addedToCart().has(productId);
  }
}
