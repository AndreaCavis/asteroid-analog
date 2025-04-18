// src/app/components/searchbar/searchbar.component.ts

import {
  Component,
  inject,
  signal,
  ViewChild,
  ElementRef,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { debounce } from '../../utils/debounce';

@Component({
  selector: 'app-searchbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex justify-center w-full">
      <form (submit)="onSubmit($event)" class="flex-none relative w-full">
        <!-- Search Input -->
        <input
          #searchInput
          type="search"
          class="search-shadow w-full my-8 p-3 rounded-full bg-transparent text-accent-foreground"
          placeholder="Search for supplements..."
          [(ngModel)]="searchValue"
          name="search"
          (input)="onInputChange($event)"
          (keydown)="onKeyDown($event)"
          (blur)="onBlur()"
          aria-autocomplete="list"
          role="combobox"
          aria-label="Search supplements"
        />

        <!-- Search Icon -->
        <button
          class="absolute right-0 top-1/2 -translate-y-1/2 p-3 rounded-full"
          (click)="onSubmit($event)"
          aria-label="Search supplements"
        >
          <i
            class="pi pi-search transition-all duration-300 absolute right-0 text-2xl text-primary opacity-75 hover:opacity-100 top-1/2 -translate-y-1/2 p-3 rounded-full"
          ></i>
        </button>

        <!-- Suggestions Dropdown -->
        @if (activeSearch().length > 0) {
        <div
          class="absolute z-50 top-24 bg-black rounded-md text-accent-foreground w-full flex flex-col gap-2"
          role="listbox"
        >
          @for (item of activeSearch(); track item; let i = $index ) {
          <span
            class="hover:bg-stone-800 rounded-md pl-4"
            [class.bg-stone-800.rounded-md.pl-4]="i === selectedIndex()"
            (click)="handleSuggestionClick(item)"
            (mouseenter)="selectedIndex.set(i)"
            role="option"
            [attr.aria-selected]="i === selectedIndex()"
          >
            <span [innerHTML]="highlightMatch(item, searchValue())"></span>
          </span>
          }
        </div>
        }
      </form>
    </div>
  `,
})
export class SearchbarComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  searchValue = signal('');
  allProductNames = signal<string[]>([]);
  activeSearch = signal<string[]>([]);
  selectedIndex = signal<number>(-1);
  isLoading = signal(false);

  ngOnInit() {
    const query = this.route.snapshot.queryParamMap.get('query') || '';
    this.searchValue.set(query);
    this.fetchProductNames();
  }

  onInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchValue.set(target.value);
    this.debouncedHandleSearch();
  }

  private debouncedHandleSearch = debounce(() => {
    const params = new URLSearchParams(this.route.snapshot.queryParams);
    const query = this.searchValue().trim().toLowerCase();
    this.searchValue.set(query);
    query ? params.set('query', query) : params.delete('query'); // Set the query parameter to the search text
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: Object.fromEntries(params),
    });

    if (!query) {
      this.activeSearch.set([]);
      return;
    }

    const suggestions = this.allProductNames()
      .filter((name) => name.toLowerCase().includes(query))
      .slice(0, 8);
    this.activeSearch.set(suggestions);
    this.selectedIndex.set(-1);
  }, 300);

  // Function to handle clicking on a suggestion
  handleSuggestionClick(productName: string) {
    this.searchValue.set(productName);
    this.activeSearch.set([]);

    const params = new URLSearchParams();
    params.set('query', productName);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: Object.fromEntries(params),
    });
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (!this.searchValue().trim()) return;

    // Navigate to search page with query params
    const params = new URLSearchParams();
    params.set('query', this.searchValue());
    this.router.navigateByUrl(`/search?${params.toString()}`);

    this.activeSearch.set([]);
  }

  onKeyDown(event: KeyboardEvent) {
    const suggestions = this.activeSearch();
    const total = suggestions.length;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex.update((i) => (i + 1) % total);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex.update((i) => (i - 1 + total) % total);
        break;
      case 'Enter':
        event.preventDefault();

        if (this.selectedIndex() >= 0 && this.activeSearch().length > 0) {
          this.handleSuggestionClick(suggestions[this.selectedIndex()]);
        } else {
          this.onSubmit(event);
        }

        this.activeSearch.set([]);
        break;
    }
  }

  onBlur() {
    setTimeout(() => this.activeSearch.set([]), 100);
  }

  highlightMatch(text: string, query: string): string {
    if (!query.trim()) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.replace(
      regex,
      `<span class="text-primary font-bold">$1</span>`
    );
  }

  private async fetchProductNames() {
    this.isLoading.set(true);
    try {
      const res = await fetch('http://localhost:5173/api/query?search=');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();

      if (Array.isArray(data)) {
        if (data.length === 0) {
          this.allProductNames.set([]);
          return;
        }
        // If it's an array of products (objects), map to names
        if (typeof data[0] === 'object' && data[0]?.name) {
          this.allProductNames.set(data.map((p) => p.name));
        }
        // If it's already an array of strings
        else if (typeof data[0] === 'string') {
          this.allProductNames.set(data);
        }
      } else {
        console.error('Invalid data format received from API');
        this.allProductNames.set([]);
      }
    } catch (err) {
      console.error('❌ Failed to fetch product names:', err);
      this.allProductNames.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }
}
