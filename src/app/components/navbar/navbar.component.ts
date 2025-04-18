// src/app/components/navbar/navbar.component.ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav
      class="fixed top-0 w-full z-50 bg-gradient-to-b from-black/70 to-transparent px-6 py-4"
    >
      <a
        routerLink="/"
        class="text-white font-bold text-2xl hover:opacity-75 transition-opacity w-1/6 block"
      >
        🪐 Asteroid
      </a>
    </nav>
  `,
})
export class NavbarComponent {}
