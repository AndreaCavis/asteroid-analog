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
    <main class="mx-auto max-w-7xl pt-4 px-4 sm:px-6 lg:px-8">
      <div
        class="flex items-baseline justify-between border-b-2 border-stone-600 pb-4"
      >
        <h1
          class="font-semibold tracking-tight text-accent-foreground lg:text-4xl md:text-3xl sm:text-2xl text-xl "
        >
          Find the
          <span class="text-primary underlined">supplements</span> you're
          looking for
        </h1>
      </div>

      <div class="flex justify-center">
        <app-searchbar class="w-1/2" />
      </div>

      <div
        class="m-4 grid gap-x-4 gap-y-8 lg:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] md:grid-cols-3 sm:grid-cols-3 grid-cols-3"
      >
        @if (showSkeletons()) { @for (s of skeletons; track s) {
        <app-product-card-skeleton />
        } } @else if (!isEmpty()) { @for (product of products(); track
        product.id) {
        <app-product-card [product]="product" />} } @else {
        <app-empty-state [name]="" class="col-span-full" />
        }
      </div>
    </main>
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
