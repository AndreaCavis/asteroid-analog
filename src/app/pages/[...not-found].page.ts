// src/app/pages/[...not-found].page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-not-found',
  template: `
    <main class="flex flex-col items-center text-center py-12 px-4">
      <h1
        class="text-6xl md:text-8xl font-bold text-primary hover:scale-110 transition-transform duration-300 ease-in"
      >
        404
      </h1>
      <h2 class="mt-4 text-lg md:text-xl text-muted">
        Sorry, an asteroid destroyed this page. It can't be found anymore :{{
          '('
        }}
      </h2>
      <a
        routerLink="/"
        class="mt-6 inline-block underline text-blue-500 hover:text-blue-700"
      >
        Return to Homepage
      </a>
      <img
        src="/asteroid-icon-pink.png"
        alt="Asteroid"
        class="mt-8 h-48 w-48 md:h-64 md:w-64 object-contain"
      />
    </main>
  `,
})
export default class NotFoundPage {}
