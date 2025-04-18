// src/app/pages/search.page.ts

import { Component, inject, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { FiltersContext } from '../contexts/filters.context';
import { SearchbarComponent } from '../components/searchbar/searchbar.component';
import { ProductCardComponent } from '../components/products/product-card/product-card.component';
import { EmptyStateComponent } from '../components/products/empty-state/empty-state.component';
import { ProductCardSkeletonComponent } from '../components/products/product-card-skeleton/product-card-skeleton.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    SearchbarComponent,
    ProductCardComponent,
    EmptyStateComponent,
    ProductCardSkeletonComponent,
  ],
  template: `
    <main class="flex flex-col gap-6 w-full">
      <app-searchbar />

      <!-- Header if results -->
      @if (searchQuery() && products().length > 0) {
      <h1 class="text-2xl font-bold">Results for “{{ searchQuery() }}”</h1>
      }
      <!-- conditional page rendering -->
      @if(searchQuery()) {
      <!-- empty state -->
      @if(products().length === 0) {
      <app-empty-state [name]="searchQuery()" />
      }
      <!-- skeleton and products grid -->
      @else {
      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        <!-- skeleton -->
        @if (!products()) { @for (i of skeletonCount; track skeletonCount[i]) {
        <app-product-card-skeleton />
        } }
        <!-- products grid -->
        @else { @for (product of products(); track product.id) {
        <app-product-card [product]="product" />
        } }
      </div>
      } }
    </main>
  `,
})
export default class SearchResultsPage {
  private route = inject(ActivatedRoute);
  private filters = inject(FiltersContext);

  // Query from URL
  private query = this.route.snapshot.queryParamMap.get('query') || '';

  // Signals from context
  products = this.filters.products$;
  searchQuery = this.filters.searchQuery$;

  // Static skeletons array
  skeletonCount = Array(12);

  // Debounced fetch on query change
  constructor() {
    // Always apply query to context (no reset here)
    this.filters.setSearchQuery(this.query);

    // Reset filters + refetch only when query changes
    effect(() => {
      this.filters.updateFilter({ ...FiltersContext.RESET_FILTERS });
      this.filters.debouncedRefetch();
    });
  }
}
