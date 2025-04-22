// src/app/pages/search.page.ts

import { Component, inject, effect } from '@angular/core';
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
    <main class="mx-auto pt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mx-auto w-1/2">
        <app-searchbar />
      </div>

      <!-- Header if results -->
      @if (searchQuery() && products().length > 0) {
      <h1 class="text-white text-2xl">
        Results for
        <span class="text-primary text-2xl underlined">{{
          searchQuery()
        }}</span>
      </h1>
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
        class="m-4 grid gap-x-4 gap-y-8 lg:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] md:grid-cols-3 sm:grid-cols-3 grid-cols-3"
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
