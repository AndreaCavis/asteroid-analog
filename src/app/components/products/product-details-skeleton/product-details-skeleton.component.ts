// src/app/components/products/product-details-skeleton/product-details-skeleton.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-details-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main>
      <!-- Back Button Skeleton -->
      <div class="flex">
        <div
          class="mt-4 mr-auto ml-12 text-stone-500 lg:text-4xl md:text-3xl sm:text-2xl text-xl animate-pulse"
        >
          <i class="pi pi-arrow-left"></i>
        </div>
      </div>

      <!-- Skeleton Layout -->
      <div
        class="container mx-auto p-8 flex flex-col lg:flex-row items-center lg:items-start"
      >
        <!-- Image Skeleton -->
        <div class="lg:w-1/2 w-full flex justify-center lg:pr-8">
          <div
            class="w-full lg:max-w-md md:max-w-xs sm:max-w-72 h-[400px] bg-stone-800 rounded-3xl animate-pulse"
          ></div>
        </div>

        <!-- Text Skeleton -->
        <div class="lg:w-1/2 w-full text-center lg:text-left mt-6 lg:mt-0">
          <div
            class="lg:h-10 md:h-8 sm:h-6 h-5 bg-stone-800 rounded-md w-1/2 mb-4 animate-pulse"
          ></div>
          <div
            class="lg:h-8 md:h-6 sm:h-5 h-4 bg-stone-800 rounded-md w-2/3 mb-6 animate-pulse"
          ></div>
          <div
            class="lg:h-6 md:h-5 sm:h-4 h-3 bg-stone-800 rounded-md w-1/4 mb-6 animate-pulse"
          ></div>
          <div
            class="lg:h-8 md:h-6 sm:h-5 h-4 bg-stone-800 rounded-md w-1/2 mb-4 animate-pulse"
          ></div>
          <div
            class="lg:h-6 md:h-5 sm:h-4 h-3 bg-stone-800 rounded-md w-3/4 animate-pulse"
          ></div>
        </div>
      </div>
    </main>
  `,
})
export class ProductDetailsSkeletonComponent {}
