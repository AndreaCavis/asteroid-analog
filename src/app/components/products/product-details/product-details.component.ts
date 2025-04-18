// src/app/components/products/product-details/product-details.component.ts
import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from 'src/app/utils/validators/product.validators';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import { Location } from '@angular/common';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [provideIcons({ lucideArrowLeft })],
  template: `
    <main>
      <!-- 🔙 Back Button -->
      <div class="flex">
        <button
          (click)="goBack()"
          class="transition-all duration-300 mt-4 mr-auto ml-12 text-accent-foreground hover:text-primary
                 lg:text-4xl md:text-3xl sm:text-2xl text-xl"
        >
          <ng-icon name="lucideArrowLeft" />
        </button>
      </div>

      <!-- 📦 Product Layout -->
      <div
        class="container mx-auto p-8 flex flex-col lg:flex-row items-center lg:items-start"
      >
        <!-- 🖼 Image -->
        <div class="lg:w-1/2 w-full flex justify-center lg:pr-8">
          <img
            [src]="'/' + product.imageUrl"
            [alt]="product.name + ' image'"
            class="w-full lg:max-w-md md:max-w-xs sm:max-w-72 h-auto rounded-3xl ring-4 pink-shadow"
            width="400"
            height="400"
          />
        </div>

        <!-- 📝 Text Content -->
        <div class="lg:w-1/2 w-full text-center lg:text-left mt-6 lg:mt-0">
          <h1
            class="lg:text-5xl md:text-4xl sm:text-3xl text-2xl font-bold mb-4 text-accent-foreground"
          >
            {{ product.name }}
          </h1>

          <h2 class="lg:text-3xl md:text-2xl sm:text-xl text-lg font-bold mb-6">
            {{ product.brand }}
          </h2>

          <p
            class="lg:text-2xl md:text-xl sm:text-lg text-base text-accent-foreground mb-6"
          >
            £{{ product.price.toFixed(2) }}
          </p>

          <h3
            class="lg:text-3xl md:text-2xl sm:text-xl text-lg font-semibold mb-4"
          >
            Suggested Use
          </h3>

          <p
            class="lg:text-xl md:text-lg sm:text-base text-sm text-accent-foreground"
          >
            {{ product.suggested_use }}
          </p>
        </div>
      </div>
    </main>
  `,
})
export class ProductDetailsComponent {
  @Input() product!: Product;

  goBack() {
    window.history.back();
  }
}
