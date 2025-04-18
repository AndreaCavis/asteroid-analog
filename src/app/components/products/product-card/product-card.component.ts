// src/app/components/product-card/product-card.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../utils/validators/product.validators';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <a
      [routerLink]="['/products/' + product.id]"
      class="border rounded shadow p-4 flex flex-col justify-between h-full bg-white dark:bg-gray-900 hover:shadow-md transition"
    >
      @if (product.imageUrl) {
      <img
        [src]="product.imageUrl"
        alt="{{ product.name }}"
        class="w-full h-40 object-cover rounded mb-4"
      />
      }

      <div class="flex-grow">
        <h2 class="font-semibold text-lg mb-1">{{ product.name }}</h2>
        <p class="text-sm text-gray-500 mb-1">Brand: {{ product.brand }}</p>
        <p class="text-sm text-gray-400 mb-2 capitalize">
          Type: {{ product.type }}
        </p>
        <p class="text-sm text-gray-600">
          {{ product.suggested_use }}
        </p>
      </div>

      <div class="mt-4 font-semibold text-blue-600">
        £{{ product.price.toFixed(2) }}
      </div>
    </a>
  `,
})
export class ProductCardComponent {
  @Input() product!: Product;
}
