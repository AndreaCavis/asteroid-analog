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
      [routerLink]="['/products', product.id]"
      class="group bg-none rounded-md w-52"
    >
      @if (product.imageUrl) {
      <img
        [src]="'/' + product.imageUrl"
        alt="{{ product.name }} + image"
        width="208"
        height="208"
        class="object-fill rounded-md lg:w-52 lg:h-52 md:w-44 md:h-44 sm:w-32 sm:h-32 w-24 h-24
          group-hover:opacity-100 scale-90 opacity-75 group-hover:scale-100 transition-all duration-300 ease"
      />
      }

      <div>
        <div
          class="p-2 lg:w-52 md:w-44 sm:w-32 w-24 lg:text-lg md:text-base sm:text-sm text-xs"
        >
          <h2
            class="animated-text transition-opacity duration-200 opacity-75 group-hover:opacity-100 
          lg:text-xl md:text-lg sm:text-base text-sm font-semibold"
          >
            {{ product.name }}
          </h2>
          <h3
            class="transition-all duration-200 opacity-75 group-hover:opacity-100 text-accent-foreground font-normal mb-1"
          >
            {{ product.brand }}
          </h3>
          <p
            class="text-accent-foreground font-semibold opacity-75 transition-all duration-0 group-hover:opacity-100"
          >
            £ <span class="text-primary">{{ product.price }}</span>
          </p>
        </div>
      </div>
    </a>
  `,
})
export class ProductCardComponent {
  @Input() product!: Product;
}
