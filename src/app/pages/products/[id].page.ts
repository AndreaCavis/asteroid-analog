// src/app/pages/products/[id].page.ts

import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import {
  Product,
  ProductValidator,
} from '../../utils/validators/product.validators';

import { ProductDetailsComponent } from '../../components/products/product-details/product-details.component';
import { ProductDetailsSkeletonComponent } from '../../components/products/product-details-skeleton/product-details-skeleton.component';
import NotFoundPage from '../[...not-found].page';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ProductDetailsComponent,
    ProductDetailsSkeletonComponent,
    NotFoundPage,
  ],
  template: `
    <!-- 🧱 Error state -->
    <ng-container *ngIf="error(); else loadingOrLoaded">
      <app-not-found />
    </ng-container>

    <!-- 💾 Skeleton or Details -->
    <ng-template #loadingOrLoaded>
      <ng-container *ngIf="product() as resolvedProduct; else loading">
        <app-product-details [product]="resolvedProduct" />
      </ng-container>

      <ng-template #loading>
        <app-product-details-skeleton />
      </ng-template>
    </ng-template>
  `,
})
export default class ProductDetailsPage {
  private route = inject(ActivatedRoute);

  product = signal<Product | null>(null);
  error = signal(false);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set(true);
      return;
    }

    this.fetchProductById(id);
  }

  private async fetchProductById(id: string) {
    try {
      const res = await fetch(`/api/products/${id}`);

      if (res.status === 404) {
        this.error.set(true);
        return;
      }

      const json = await res.json();
      const parsed = ProductValidator.safeParse(json);

      if (!parsed.success) {
        this.error.set(true);
        return;
      }

      this.product.set(parsed.data);
    } catch (err) {
      console.error('❌ Error fetching product:', err);
      this.error.set(true);
    }
  }
}
