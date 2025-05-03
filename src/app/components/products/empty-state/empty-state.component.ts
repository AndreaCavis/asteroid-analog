// src/app/components/empty-state/empty-state.component.ts

import { Component, Input } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { featherXCircle } from '@ng-icons/feather-icons';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [NgIconComponent],
  providers: [provideIcons({ featherXCircle })],
  template: `
    <div
      class="relative flex flex-col mx-auto p-12 lg:h-80 md:h-64 sm:h-60 h-52 w-3/4 bg-stone-900 rounded-md items-center justify-center"
    >
      <ng-icon
        name="featherXCircle"
        class="m-2 text-red-600 lg:text-5xl md:text-4xl sm:text-3xl text-2xl"
      ></ng-icon>

      <h3
        class="p-2 font-semibold text-accent-foreground lg:text-2xl md:text-lg sm:text-base text-sm"
      >
        No products found
      </h3>

      @if(name) {
      <p
        class="text-stone-400 lg:text-lg md:text-base sm:text-sm text-xs text-center"
      >
        We found no search results for
        <span class="text-primary">“{{ name }}”</span>.
      </p>
      } @else {
      <p
        class="text-stone-400 lg:text-lg md:text-base sm:text-sm text-xs text-center"
      >
        We found no search results for these filters.
      </p>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() name?: string;
}
