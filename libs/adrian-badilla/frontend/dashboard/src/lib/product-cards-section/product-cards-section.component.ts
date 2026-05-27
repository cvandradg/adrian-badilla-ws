import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { CurrencyPipe, TitleCasePipe } from '@angular/common';
import type { ProductMock } from '../mock/products/products.mock';

type Category = 'all' | 'accesorio' | 'suplemento';
type SortBy = 'featured' | 'price-asc' | 'price-desc';

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

  readonly filterSidebarOpen = signal(true);
  readonly selectedCategory = signal<Category>('all');
  readonly sortBy = signal<SortBy>('featured');

  readonly #variantIndex = signal<Record<string, number>>({});
  readonly addedToCart = signal<Set<string>>(new Set());

  readonly supplementCount = computed(
    () => this.products().filter((p) => p.category === 'suplemento').length
  );
  readonly accessoryCount = computed(
    () => this.products().filter((p) => p.category === 'accesorio').length
  );

  readonly filteredProducts = computed(() => {
    const cat = this.selectedCategory();
    const sort = this.sortBy();
    const base =
      cat === 'all'
        ? this.products()
        : this.products().filter((p) => p.category === cat);
    if (sort === 'price-asc')
      return [...base].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc')
      return [...base].sort((a, b) => b.price - a.price);
    return base;
  });

  readonly sortLabel = computed(() => {
    const map: Record<SortBy, string> = {
      featured: 'Destacados',
      'price-asc': 'Precio: menor a mayor',
      'price-desc': 'Precio: mayor a menor',
    };
    return map[this.sortBy()];
  });

  toggleSidebar(): void {
    this.filterSidebarOpen.update((v) => !v);
  }

  setCategory(category: Category): void {
    this.selectedCategory.set(category);
  }

  setSort(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as SortBy;
    this.sortBy.set(value);
  }

  activeVariantIndex(productId: string): number {
    return this.#variantIndex()[productId] ?? 0;
  }

  activeImage(productId: string): string {
    const product = this.products().find((p) => p.id === productId);
    if (!product) return '';
    const idx = this.activeVariantIndex(productId);
    const raw = product.variants?.[idx] ?? product.imageUrl;
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
