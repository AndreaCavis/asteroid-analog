// src/app/components/sidebar/sidebar.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  TYPE_FILTERS,
  BRAND_FILTERS,
  SORT_FILTERS,
  PRICE_FILTERS,
  DEFAULT_CUSTOM_PRICE,
  FiltersContext,
} from '../../contexts/filters.context';
import {
  AccordionComponent,
  AccordionItemComponent,
  AccordionTriggerComponent,
  AccordionContentComponent,
} from '../accordion/accordion.component';
import { SliderComponent } from '../slider/slider.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AccordionComponent,
    AccordionItemComponent,
    AccordionTriggerComponent,
    AccordionContentComponent,
    SliderComponent,
  ],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private filters = inject(FiltersContext);
  filter = this.filters.filter$;

  // Initialize with all panels except Sort open. add sort to the activeIndex to open it by default
  activeIndex: string[] = ['sort', 'type', 'brand'];

  // UI metadata
  sortOptions = SORT_FILTERS.options;
  typeOptions = TYPE_FILTERS.options;
  brandOptions = BRAND_FILTERS.options;
  priceOptions = PRICE_FILTERS.options;

  rangeMin = DEFAULT_CUSTOM_PRICE[0];
  rangeMax = DEFAULT_CUSTOM_PRICE[1];
  sliderStep = 5;

  isCustomPrice(): boolean {
    return this.filter().price.isCustom;
  }

  priceMin(): number {
    return this.filter().price.range[0];
  }

  priceMax(): number {
    return this.filter().price.range[1];
  }

  getCurrentPriceRange(): [number, number] {
    const range = this.filter().price.range;
    return [range[0], range[1]] as [number, number];
  }

  onActiveIndexChange(event: string | string[]) {
    this.activeIndex = Array.isArray(event) ? event : [event];
  }

  applySort(value: (typeof this.sortOptions)[number]['value']) {
    this.filters.updateFilter({ sort: value });
    this.filters.debouncedRefetch();
  }

  applyArrayFilter(
    category: 'type' | 'brand',
    value:
      | (typeof this.typeOptions)[number]['value']
      | (typeof this.brandOptions)[number]['value']
  ) {
    const current = this.filter()[category] as string[];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    this.filters.updateFilter({ [category]: updated });
    this.filters.debouncedRefetch();
  }

  selectPresetPrice(range: readonly [number, number]) {
    this.filters.updateFilter({
      price: { isCustom: false, range: [...range] },
    });
    this.filters.debouncedRefetch();
  }

  enableCustomPrice() {
    this.filters.updateFilter({
      price: { isCustom: true, range: [...DEFAULT_CUSTOM_PRICE] },
    });
    this.filters.debouncedRefetch();
  }

  onSliderChange(values: [number, number]) {
    // Update the price range with both values
    const currentFilter = this.filter();
    this.filters.setFilter({
      ...currentFilter,
      price: {
        ...currentFilter.price,
        range: values,
      },
    });
    this.filters.debouncedRefetch();
  }
}
