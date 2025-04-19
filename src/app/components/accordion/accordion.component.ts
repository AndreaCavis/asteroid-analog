import { Component, inject, signal } from '@angular/core';

// 🧠 Shared context for each AccordionItem
export class AccordionItemContext {
  isOpen = signal(false);
  toggle = () => this.isOpen.set(!this.isOpen());
}

// 🧩 Accordion Root
@Component({
  selector: 'Accordion',
  standalone: true,
  template: `<ng-content></ng-content>`,
  host: { class: 'space-y-2 block' },
})
export class AccordionComponent {}

// 🧩 Accordion Item
@Component({
  selector: 'AccordionItem',
  standalone: true,
  providers: [AccordionItemContext],
  template: `<ng-content></ng-content>`,
  host: { class: 'border-b border-stone-600' },
})
export class AccordionItemComponent {
  ctx = inject(AccordionItemContext);
}

// 🧩 Accordion Trigger
@Component({
  selector: 'AccordionTrigger',
  standalone: true,
  template: `
    <button
      (click)="ctx.toggle()"
      class="group flex w-full items-center justify-between py-4 text-sm font-medium text-left"
      [attr.aria-expanded]="ctx.isOpen()"
      [attr.data-state]="ctx.isOpen() ? 'open' : 'closed'"
    >
      <ng-content></ng-content>

      <svg
        class="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-all duration-500"
        [class.rotate-180]="ctx.isOpen()"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path d="M6 15l6-6 6 6" />
      </svg>
    </button>
  `,
})
export class AccordionTriggerComponent {
  ctx = inject(AccordionItemContext);
}

// 🧩 Accordion Content
@Component({
  selector: 'AccordionContent',
  standalone: true,
  template: `
    @if (ctx.isOpen()) {
    <div
      class="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      [attr.data-state]="ctx.isOpen() ? 'open' : 'closed'"
    >
      <div class="pb-4 pt-0">
        <ng-content></ng-content>
      </div>
    </div>
    }
  `,
})
export class AccordionContentComponent {
  ctx = inject(AccordionItemContext);
}
