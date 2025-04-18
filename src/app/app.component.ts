// src/app/app.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';
import { FiltersContext, RESET_FILTERS } from './contexts/filters.context';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, RouterOutlet],
  template: `
    <div
      class="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white"
    >
      <app-navbar />

      <div class="flex flex-1 items-stretch lg:pt-24 md:pt-20 sm:pt-16 pt-12">
        <app-sidebar />
        <main class="flex-grow px-4 py-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class AppComponent implements OnInit {
  private filters = inject(FiltersContext);

  ngOnInit(): void {
    this.filters.setFilter({ ...RESET_FILTERS });
    this.filters.debouncedRefetch(); // 🔁 mimic initial load from React layout
  }
}
