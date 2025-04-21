import {
  Component,
  ElementRef,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  Injectable,
  OnInit,
  OnDestroy,
  signal,
  computed,
  effect,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ValueConversionService {
  convertToPercentage(value: number, min: number, max: number): number {
    return ((value - min) / (max - min)) * 100;
  }

  convertFromPercentage(percentage: number, min: number, max: number): number {
    return Math.round(min + (percentage / 100) * (max - min));
  }
}

@Component({
  selector: 'app-slider-thumb',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      #thumb
      class="absolute top-1/2 -translate-y-1/2 transform block h-4 w-4 rounded-full border-2 border-primary bg-background transition-colors disabled:pointer-events-none disabled:opacity-50"
      [ngStyle]="getPositionStyle()"
      [class.cursor-grab]="!disabled"
      [class.cursor-grabbing]="isDragging"
      [class.opacity-50]="disabled"
      role="slider"
      [attr.aria-label]="ariaLabel"
      [attr.aria-valuenow]="value"
      [attr.aria-disabled]="disabled"
      (mousedown)="onMouseDown($event)"
    ></div>
  `,
})
export class SliderThumbComponent implements OnInit, OnDestroy {
  @Input() position = 0;
  @Input() value = 0;
  @Input() disabled = false;
  @Input() ariaLabel = '';

  @Output() thumbMove = new EventEmitter<MouseEvent>();

  @ViewChild('thumb') thumbElement!: ElementRef<HTMLDivElement>;

  protected isDragging = false;

  private boundMouseMove: (e: MouseEvent) => void;
  private boundMouseUp: () => void;

  constructor() {
    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundMouseUp = this.onMouseUp.bind(this);
  }

  getPositionStyle(): { [key: string]: string } {
    return {
      left: `${this.position}%`,
      transform: `translateX(-50%) translateY(-50%)`,
      transition: this.isDragging ? 'none' : 'left 0.1s ease-out',
    };
  }

  onMouseDown(event: MouseEvent): void {
    if (this.disabled) return;

    event.preventDefault();
    this.isDragging = true;

    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);

    this.thumbMove.emit(event);
  }

  onMouseMove(event: MouseEvent): void {
    if (this.disabled || !this.isDragging) return;
    this.thumbMove.emit(event);
  }

  onMouseUp(): void {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
  }

  ngOnInit(): void {
    this.updateAriaAttributes();
  }

  ngOnDestroy(): void {
    this.thumbMove.complete();
    if (this.isDragging) {
      document.removeEventListener('mousemove', this.boundMouseMove);
      document.removeEventListener('mouseup', this.boundMouseUp);
    }
  }

  private updateAriaAttributes(): void {
    if (!this.thumbElement?.nativeElement) return;
    const element = this.thumbElement.nativeElement;
    element.setAttribute('aria-valuenow', this.value.toString());
    if (this.ariaLabel) {
      element.setAttribute('aria-label', this.ariaLabel);
    }
  }
}

@Component({
  selector: 'app-slider-range',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      #rangeElement
      class="absolute h-full bg-primary transition-all"
      [ngStyle]="calculateRangeStyle()"
      [class.opacity-50]="disabled"
      role="presentation"
      [attr.aria-hidden]="true"
    ></div>
  `,
})
export class SliderRangeComponent implements OnInit, OnDestroy {
  @Input() left = 0;
  @Input() width = 0;
  @Input() disabled = false;
  @ViewChild('rangeElement') rangeElement!: ElementRef<HTMLDivElement>;

  private animationState: 'idle' | 'moving' = 'idle';
  private readonly transitionDuration = 150;
  private animationTimeout?: number;

  calculateRangeStyle(): { [key: string]: string } {
    return {
      left: `${this.left}%`,
      width: `${this.width}%`,
      transition: this.getTransitionStyle(),
      pointerEvents: this.disabled ? 'none' : 'auto',
    };
  }

  private getTransitionStyle(): string {
    if (this.animationState === 'moving') {
      this.animationTimeout = window.setTimeout(() => {
        this.animationState = 'idle';
      }, this.transitionDuration);
    }
    return this.animationState === 'idle'
      ? 'none'
      : `left ${this.transitionDuration}ms ease, width ${this.transitionDuration}ms ease`;
  }

  ngOnInit(): void {
    this.updateAriaAttributes();
  }

  ngOnDestroy(): void {
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
    }
  }

  private updateAriaAttributes(): void {
    if (!this.rangeElement?.nativeElement) return;
    const element = this.rangeElement.nativeElement;
    element.setAttribute('role', 'presentation');
    element.setAttribute('aria-hidden', 'true');
  }
}

@Component({
  selector: 'app-slider-track',
  standalone: true,
  imports: [CommonModule, SliderRangeComponent],
  template: `
    <div
      #trackElement
      class="relative h-1 w-full rounded-full bg-gray-200"
      (click)="onClick($event)"
    >
      <ng-content></ng-content>
    </div>
  `,
})
export class SliderTrackComponent {
  @Output() trackClick = new EventEmitter<{
    position: number;
    thumbIndex: number;
  }>();
  @ViewChild('trackElement') trackElement!: ElementRef<HTMLDivElement>;

  onClick(event: MouseEvent): void {
    const rect = this.trackElement.nativeElement.getBoundingClientRect();
    const position = ((event.clientX - rect.left) / rect.width) * 100;
    this.trackClick.emit({ position, thumbIndex: 0 });
  }
}

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [
    CommonModule,
    SliderTrackComponent,
    SliderRangeComponent,
    SliderThumbComponent,
  ],
  template: `
    <div class="relative w-full">
      <app-slider-track (trackClick)="onTrackClick($event)">
        <app-slider-range
          [left]="rangePosition().left"
          [width]="rangePosition().width"
        ></app-slider-range>
        <ng-container *ngFor="let value of currentValues(); let i = index">
          <app-slider-thumb
            [position]="thumbPositions()[i]"
            (mousedown)="onThumbMouseDown($event, i)"
          ></app-slider-thumb>
        </ng-container>
      </app-slider-track>
    </div>
  `,
})
export class SliderComponent implements OnInit, OnDestroy {
  @Input() min = 0;
  @Input() max = 100;
  @Output() valuesChange = new EventEmitter<number[]>();

  private readonly _values: WritableSignal<number[]> = signal([0, 0]);
  private readonly _positions: WritableSignal<number[]> = signal([0, 0]);

  protected readonly currentValues = computed(() => this._values());
  protected readonly thumbPositions = computed(() => this._positions());
  protected readonly rangePosition = computed(() => ({
    left: this._positions()[0],
    width: this._positions()[1] - this._positions()[0],
  }));

  private activeThumbIndex: number | null = null;
  private mouseMoveListener: ((e: MouseEvent) => void) | null = null;
  private mouseUpListener: (() => void) | null = null;

  @ViewChild('track') trackElement!: ElementRef<HTMLElement>;

  constructor(private valueConversion: ValueConversionService) {
    effect(() => {
      const newValues = this.currentValues();
      const newPositions = newValues.map((value) =>
        this.valueConversion.convertToPercentage(value, this.min, this.max)
      );
      this._positions.set(newPositions);
    });
  }

  @Input() set values(newValues: number[]) {
    if (!Array.isArray(newValues) || newValues.length !== 2) return;

    const validatedValues = newValues.map((value) =>
      Math.max(this.min, Math.min(this.max, value))
    );

    if (validatedValues[0] > validatedValues[1]) {
      [validatedValues[0], validatedValues[1]] = [
        validatedValues[1],
        validatedValues[0],
      ];
    }

    this._values.set(validatedValues);
  }

  private updateThumbPosition(index: number, position: number): void {
    if (index < 0 || index > 1) return;

    const currentPositions = this._positions();
    const newPositions = [...currentPositions];
    newPositions[index] = Math.max(0, Math.min(100, position));

    // Ensure thumbs don't cross
    if (index === 0 && newPositions[0] >= newPositions[1]) {
      newPositions[0] = newPositions[1];
    } else if (index === 1 && newPositions[1] <= newPositions[0]) {
      newPositions[1] = newPositions[0];
    }

    this._positions.set(newPositions);

    // Update actual values
    const newValues = newPositions.map((pos) =>
      this.valueConversion.convertFromPercentage(pos, this.min, this.max)
    );
    this._values.set(newValues);
    this.emitValues();
  }

  onTrackClick(event: { position: number; thumbIndex: number }): void {
    const { position, thumbIndex } = event;
    if (this.canMoveThumb(position, thumbIndex)) {
      this.updateThumbPosition(thumbIndex, position);
    }
  }

  onThumbMouseDown(event: MouseEvent, index: number): void {
    event.preventDefault();
    this.activeThumbIndex = index;

    this.mouseMoveListener = (e: MouseEvent) => this.onMouseMove(e);
    this.mouseUpListener = () => this.onMouseUp();

    document.addEventListener('mousemove', this.mouseMoveListener);
    document.addEventListener('mouseup', this.mouseUpListener);
  }

  private onMouseMove(event: MouseEvent): void {
    if (this.activeThumbIndex === null) return;

    const trackRect = this.trackElement.nativeElement.getBoundingClientRect();
    const position = Math.max(
      0,
      Math.min(100, ((event.clientX - trackRect.left) / trackRect.width) * 100)
    );

    if (this.canMoveThumb(position, this.activeThumbIndex)) {
      this.updateThumbPosition(this.activeThumbIndex, position);
    }
  }

  private onMouseUp(): void {
    this.activeThumbIndex = null;
    this.removeEventListeners();
  }

  private canMoveThumb(position: number, index: number): boolean {
    const positions = this._positions();
    return index === 0 ? position < positions[1] : position > positions[0];
  }

  private emitValues(): void {
    this.valuesChange.emit([...this._values()]);
  }

  ngOnInit(): void {
    this.setupEventListeners();
  }

  ngOnDestroy(): void {
    this.removeEventListeners();
  }

  private setupEventListeners(): void {
    this.mouseMoveListener = (e: MouseEvent) => this.onMouseMove(e);
    this.mouseUpListener = () => this.onMouseUp();
  }

  private removeEventListeners(): void {
    if (this.mouseMoveListener) {
      document.removeEventListener('mousemove', this.mouseMoveListener);
    }
    if (this.mouseUpListener) {
      document.removeEventListener('mouseup', this.mouseUpListener);
    }
  }
}
