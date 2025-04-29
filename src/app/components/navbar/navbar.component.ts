// src/app/components/navbar/navbar.component.ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav
      class="navbar max-h-24 backdrop-blur-3xl bg-gradient-to-b from-black/0 via-black/0 to-black/0
     hover:bg-black/50 transition-all duration-200"
    >
      <a routerLink="/">
        <img
          src="/asteroid-pink.png"
          alt="Asteroid logo"
          width="334"
          height="100"
          class="w-1/6 h-auto m-2 inline-block duration-200 hover:animate-pulse hover:duration-1000"
        />
      </a>
    </nav>
  `,
})
export class NavbarComponent {}
