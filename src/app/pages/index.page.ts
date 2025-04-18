// src/app/pages/index.page.ts
import { Component, inject, computed } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FiltersContext } from '../contexts/filters.context';
import { ProductCardComponent } from '../components/products/product-card/product-card.component';
import { ProductCardSkeletonComponent } from '../components/products/product-card-skeleton/product-card-skeleton.component';
import { EmptyStateComponent } from '../components/products/empty-state/empty-state.component';
import { SearchbarComponent } from '../components/searchbar/searchbar.component';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [
    ProductCardComponent,
    ProductCardSkeletonComponent,
    EmptyStateComponent,
    SearchbarComponent,
  ],
  template: `
    <div class="min-h-screen flex flex-col items-center p-6 max-w-5xl mx-auto">
      <h1 class="text-3xl md:text-5xl font-bold text-center my-8">
        Search and compare supplements from multiple brands
      </h1>

      <div class="w-full max-w-md mb-8">
        <app-searchbar />
      </div>

      <div class="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        @if (showSkeletons()) { @for (s of skeletons; track s) {
        <app-product-card-skeleton />
        } } @else if (!isEmpty()) { @for (product of products(); track
        product.id) {
        <app-product-card [product]="product" />} } @else {
        <app-empty-state [name]="" />
        }
      </div>
    </div>
  `,
})
export default class IndexPage {
  private filters = inject(FiltersContext);

  products = this.filters.products$;
  searchQuery = this.filters.searchQuery$;
  filter = this.filters.filter$;

  skeletons = Array.from({ length: 12 });

  isEmpty = computed(() => {
    const products = this.products();
    const filter = this.filter();
    return (
      products.length === 0 &&
      (filter.brand.length === 0 || filter.type.length === 0)
    );
  });

  showSkeletons = computed(() => {
    const products = this.products();
    const filter = this.filter();
    return (
      products.length === 0 && filter.brand.length > 0 && filter.type.length > 0
    );
  });
}
