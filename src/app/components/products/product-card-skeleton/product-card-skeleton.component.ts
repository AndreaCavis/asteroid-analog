// src/app/components/product-card-skeleton/product-card-skeleton.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-product-card-skeleton',
  standalone: true,
  template: `
    <main className="bg-none rounded-md lg:w-52 md:w-44 sm:w-32 w-24">
      <!-- Image Skeleton -->
      <div
        class="flex justify-center bg-stone-800 rounded-md lg:w-52 lg:h-52 md:w-44 md:h-44 sm:w-32 sm:h-32 w-24 h-24 animate-pulse"
      ></div>

      <!-- Text Skeleton  -->
      <div class="lg:w-52 md:w-44 sm:w-32 w-24 p-2 animate-pulse">
        <div class="h-6 bg-stone-800 rounded-md mb-2 w-3/4 animate-pulse"></div>
        <div class="h-4 bg-stone-800 rounded-md mb-1 w-2/3 animate-pulse"></div>
        <div class="h-4 bg-stone-800 rounded-md w-1/2 animate-pulse"></div>
      </div>
    </main>
  `,
})
export class ProductCardSkeletonComponent {}
