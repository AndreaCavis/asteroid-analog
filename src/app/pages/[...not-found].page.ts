// src/app/pages/[...not-found].page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-not-found',
  template: `
    <main class="flex mx-auto flex-col items-center pt-4">
      <h1
        class="lg:text-8xl md:text-6xl sm:text-4xl text-2xl font-bold mb-6 hover:scale-110 duration-300 ease-in text-primary"
      >
        404
      </h1>
      <h2
        class="lg:text-4xl md:text-2xl sm:text-lg text-base text-accent-foreground font-normal mb-4 text-center"
      >
        Sorry, an asteroid destroyed this page. It can't be found anymore :{{
          '('
        }}
      </h2>
      <a
        routerLink="/"
        class="lg:text-4xl md:text-2xl sm:text-lg text-base underlined"
      >
        Return to Home
      </a>
      <img
        src="/asteroid-icon-pink.png"
        alt="Asteroid picture"
        width="256"
        height="256"
        class="lg:h-64 md:h-56 sm:h-52 h-48 lg:w-64 md:w-56 sm:w-52 w-48 hover:animate-ping mt-8"
      />
    </main>
  `,
})
export default class NotFoundPage {}
