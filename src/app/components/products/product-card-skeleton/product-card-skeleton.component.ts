// src/app/components/product-card-skeleton/product-card-skeleton.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-product-card-skeleton',
  standalone: true,
  template: `
    <div class="border rounded shadow p-4 animate-pulse space-y-2">
      <div class="h-5 bg-gray-300 rounded w-3/4"></div>
      <div class="h-4 bg-gray-200 rounded w-full"></div>
      <div class="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  `,
})
export class ProductCardSkeletonComponent {}
