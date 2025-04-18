// src/app/components/navbar/navbar.component.ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav
      class="navbar max-h-24 backdrop-blur-sm bg-gradient-to-b from-black/60 via-black/40 to-black/60
     hover:bg-black/90 transition-all duration-200"
    >
      <a routerLink="/">
        <img
          src="/asteroid-pink.png"
          alt="Asteroid logo"
          width="334"
          height="100"
          class="w-1/6 h-auto m-2 inline-block duration-200 hover:animate-pulse"
        />
      </a>
    </nav>
  `,
})
export class NavbarComponent {}
