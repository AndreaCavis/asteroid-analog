// src/app/contexts/filters.context.ts

import {
  Injectable,
  signal,
  effect,
  inject,
  runInInjectionContext,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Injector } from '@angular/core';
import { filter as rxFilter } from 'rxjs/operators';

import type {
  Product,
  ProductState,
} from '../utils/validators/product.validators';

// 🔁 UI FILTER METADATA (from React)
export const TYPE_FILTERS = {
  id: 'type',
  name: 'Type',
  options: [
    { value: 'bcaa', label: 'BCAA' },
    { value: 'beta alanine', label: 'Beta-Alanine' },
    { value: 'creatine', label: 'Creatine' },
    { value: 'whey protein', label: 'Whey Protein' },
  ],
} as const;

export const BRAND_FILTERS = {
  id: 'brand',
  name: 'Brand',
  options: [
    { value: 'MyProtein', label: 'MyProtein' },
    { value: 'Optimum Nutrition', label: 'Optimum Nutrition' },
    { value: 'Yamamoto Nutrition', label: 'Yamamoto Nutrition' },
  ],
} as const;

export const SORT_FILTERS = {
  id: 'sort',
  name: 'Sort',
  options: [
    { value: 'none', label: 'None' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
  ],
} as const;

export const PRICE_FILTERS = {
  id: 'price',
  name: 'Price',
  options: [
    { value: [0, 100], label: 'Any price' },
    { value: [0, 25], label: 'Under £25' },
    { value: [0, 50], label: 'Under £50' },
    { value: [0, 75], label: 'Under £75' },
  ],
} as const;

export const DEFAULT_CUSTOM_PRICE: [number, number] = [0, 100];

// 🔁 Reset filter object (matches React RESET_FILTERS exactly)
export const RESET_FILTERS: ProductState = {
  type: ['bcaa', 'beta alanine', 'creatine', 'whey protein'],
  brand: ['MyProtein', 'Optimum Nutrition', 'Yamamoto Nutrition'],
  sort: 'none',
  price: {
    isCustom: false,
    range: DEFAULT_CUSTOM_PRICE,
  },
};

@Injectable({ providedIn: 'root' })
export class FiltersContext {
  // 🔁 Reactive state signals
  private filter = signal<ProductState>({ ...RESET_FILTERS });
  private searchQuery = signal('');
  private products = signal<Product[]>([]);

  private debounceRef: any;

  private _lastFilterString = '';
  private _lastSearchString = '';

  // ✅ Exposed reactive state
  public readonly filter$ = this.filter.asReadonly();
  public readonly searchQuery$ = this.searchQuery.asReadonly();
  public readonly products$ = this.products.asReadonly();

  // ✅ Public update API
  public readonly updateFilter = (partial: Partial<ProductState>) => {
    this.filter.update((prev) => ({
      ...prev,
      ...partial,
    }));
  };

  public readonly setFilter = this.filter.set.bind(this.filter);

  public readonly setSearchQuery = (query: string) => {
    this.searchQuery.set(query);
  };
  static RESET_FILTERS: Partial<ProductState>;

  constructor() {
    const router = inject(Router);
    const route = inject(ActivatedRoute);
    const injector = inject(Injector);

    // 🧭 Watch route changes
    runInInjectionContext(injector, () => {
      router.events
        .pipe(rxFilter((e) => e instanceof NavigationEnd))
        .subscribe(() => {
          const currentPath = router.url.split('?')[0];
          const query = route.snapshot.queryParamMap.get('query') || '';

          if (currentPath === '/') {
            this.setFilter({ ...RESET_FILTERS });
            this.searchQuery.set('');
          } else if (currentPath === '/search') {
            // ✅ React parity: keep query in filter structure
            this.setFilter({
              ...RESET_FILTERS,
              // No "searchQuery" in ProductState type — handled separately
            });
            this.searchQuery.set(query);
          }

          this.debouncedRefetch();
        });
    });

    // 🔁 Refetch on filter or query change
    effect(() => {
      const currentFilter = this.filter();
      const currentSearch = this.searchQuery();

      const filterString = JSON.stringify(currentFilter);
      const searchString = currentSearch;

      // If nothing changed, do nothing
      if (
        filterString === this._lastFilterString &&
        searchString === this._lastSearchString
      ) {
        return;
      }

      this._lastFilterString = filterString;
      this._lastSearchString = searchString;

      this.debouncedRefetch();
    });

    // 🔁 Adjust filter options to available values in results
    effect(() => {
      const products = this.products();
      if (products.length === 0) return;

      const availableBrands = [...new Set(products.map((p) => p.brand))];
      const availableTypes = [...new Set(products.map((p) => p.type))];

      this.filter.update((prev) => ({
        ...prev,
        brand: prev.brand.filter((b) => availableBrands.includes(b)),
        type: prev.type.filter((t) => availableTypes.includes(t)),
      }));
    });
  }

  // 🔁 Debounced product fetch
  debouncedRefetch = () => {
    clearTimeout(this.debounceRef);
    this.debounceRef = setTimeout(() => {
      this.fetchProducts();
    }, 400);
  };

  // 📡 Backend fetch (validated)
  private async fetchProducts() {
    const filter = this.filter();
    const query = this.searchQuery();

    const payload = {
      filter: {
        brand: filter.brand,
        type: filter.type,
        sort: filter.sort,
        price: filter.price.range,
      },
      searchQuery: query || null,
    };

    try {
      // Use absolute URL instead of relative URL
      const res = await fetch(
        process.env.ANALOG_PUBLIC_SITE_URL + 'api/products',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error ${res.status}: ${text}`);
      }

      const data = await res.json();
      this.products.set(data);

      if (!Array.isArray(data)) throw new Error('Invalid response');
    } catch (err) {
      console.error('Failed to fetch products:', err);
      this.products.set([]);
    }
  }
}
