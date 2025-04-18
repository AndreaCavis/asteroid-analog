// src/app/components/empty-state/empty-state.component.ts

import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideCircleX } from '@ng-icons/lucide';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [NgIf, NgIconComponent],
  providers: [provideIcons({ lucideCircleX })],
  template: `
    <div
      class="flex flex-col items-center justify-center w-full text-center gap-2 py-8"
    >
      <ng-icon name="lucideCircleX" class="text-red-600 w-10 h-10" />
      <h3 class="font-semibold text-lg">No products found</h3>

      <p class="text-sm text-gray-500">
        <ng-container *ngIf="name; else noQuery">
          We found no search results for
          <span class="text-primary font-medium">“{{ name }}”</span>.
        </ng-container>

        <ng-template #noQuery>
          We found no search results for these filters.
        </ng-template>
      </p>
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() name?: string;
}
