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

  convertFromPercentage(
    percentage: number,
    min: number,
    max: number,
    step: number = 1
  ): number {
    const rawValue = min + (percentage / 100) * (max - min);
    if (step === 0) return rawValue;
    return Math.round(rawValue / step) * step;
  }

  snapToStep(value: number, min: number, max: number, step: number): number {
    if (step === 0) return value;
    const normalized = value - min;
    const steppedValue = Math.round(normalized / step) * step;
    return Math.max(min, Math.min(max, min + steppedValue));
  }
}

@Component({
  selector: 'app-slider-thumb',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      #thumb
      class="absolute top-1/2 -translate-y-1/2 transform block h-4 w-4 rounded-full border-2 border-primary bg-background transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-50"
      [ngStyle]="getPositionStyle()"
      [class]="getCursorClass()"
      [class.scale-110]="isHovered || isDragging"
      [class.border-primary-dark]="isDragging"
      role="slider"
      [attr.aria-label]="ariaLabel"
      [attr.aria-valuenow]="value"
      [attr.aria-disabled]="disabled"
      (mousedown)="onMouseDown($event)"
      (touchstart)="onTouchStart($event)"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
    ></div>
  `,
})
export class SliderThumbComponent implements OnInit, OnDestroy {
  @Input() position = 0;
  @Input() disabled = false;
  @Input() ariaLabel = '';

  private _value = 0;
  @Input()
  get value(): number {
    return this._value;
  }
  set value(newValue: number) {
    // Validate number
    if (typeof newValue !== 'number') {
      console.warn(
        'SliderThumb: Value must be a number, received:',
        typeof newValue
      );
      newValue = 0;
    }

    // Handle NaN and Infinity
    if (!Number.isFinite(newValue)) {
      console.warn(
        'SliderThumb: Value must be a finite number, received:',
        newValue
      );
      newValue = 0;
    }

    // Only emit if value actually changed
    if (this._value !== newValue) {
      this._value = newValue;
      this.updateAriaAttributes();
      this.valueChange.emit(this._value);
    }
  }

  @Output() thumbMove = new EventEmitter<{ clientX: number }>();
  @Output() dragEnd = new EventEmitter<void>();
  @Output() valueChange = new EventEmitter<number>();

  @ViewChild('thumb') thumbElement!: ElementRef<HTMLDivElement>;

  protected isDragging = false;
  protected isHovered = false;

  private boundMouseMove: (e: MouseEvent) => void;
  private boundMouseUp: () => void;
  private boundTouchMove: (e: TouchEvent) => void;
  private boundTouchEnd: () => void;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundMouseUp = this.onMouseUp.bind(this);
    this.boundTouchMove = this.onTouchMove.bind(this);
    this.boundTouchEnd = this.onTouchEnd.bind(this);
  }

  getPositionStyle(): { [key: string]: string } {
    const position = this.validatePosition(this.position);
    return {
      left: `${position}%`,
      transform: `translateX(-50%) translateY(-50%)`,
      transition: this.isDragging ? 'none' : 'all 0.3s ease-out',
    };
  }

  getCursorClass(): string {
    if (this.disabled) return '';
    return this.isDragging ? 'cursor-grabbing' : 'cursor-grab';
  }

  private validatePosition(position: number): number {
    if (isNaN(position)) {
      console.warn('SliderThumb: Invalid position value');
      return 0;
    }
    return Math.max(0, Math.min(100, position));
  }

  // Mouse Events
  onMouseEnter(): void {
    if (!this.disabled) {
      this.isHovered = true;
    }
  }

  onMouseLeave(): void {
    this.isHovered = false;
  }

  onMouseDown(event: MouseEvent): void {
    if (this.disabled || event.button !== 0) return; // Only handle left click

    event.preventDefault();
    this.startDragging();

    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);

    this.thumbMove.emit({ clientX: event.clientX });
  }

  onMouseMove(event: MouseEvent): void {
    if (this.disabled || !this.isDragging) return;
    event.preventDefault();

    if (event.buttons === 0) {
      // Mouse button was released outside the window
      this.onMouseUp();
      return;
    }

    this.thumbMove.emit({ clientX: event.clientX });
  }

  onMouseUp(): void {
    this.stopDragging();
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
  }

  // Touch Events
  onTouchStart(event: TouchEvent): void {
    if (this.disabled || event.touches.length !== 1) return;

    event.preventDefault();
    this.startDragging();

    document.addEventListener('touchmove', this.boundTouchMove, {
      passive: false,
    });
    document.addEventListener('touchend', this.boundTouchEnd);
    document.addEventListener('touchcancel', this.boundTouchEnd);

    const touch = event.touches[0];
    this.thumbMove.emit({ clientX: touch.clientX });
  }

  onTouchMove(event: TouchEvent): void {
    if (this.disabled || !this.isDragging || event.touches.length !== 1) {
      this.onTouchEnd();
      return;
    }

    event.preventDefault();
    const touch = event.touches[0];
    this.thumbMove.emit({ clientX: touch.clientX });
  }

  onTouchEnd(): void {
    this.stopDragging();
    document.removeEventListener('touchmove', this.boundTouchMove);
    document.removeEventListener('touchend', this.boundTouchEnd);
    document.removeEventListener('touchcancel', this.boundTouchEnd);
  }

  // Drag State Management
  private startDragging(): void {
    if (this.isDragging) return; // Prevent multiple drag starts

    this.isDragging = true;
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';

    // Setup resize observer for container changes during drag
    this.setupResizeObserver();
  }

  private stopDragging(): void {
    if (!this.isDragging) return;

    this.isDragging = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    this.dragEnd.emit();

    // Cleanup resize observer
    this.cleanupResizeObserver();
  }

  private setupResizeObserver(): void {
    if (!this.thumbElement?.nativeElement.parentElement) return;

    this.resizeObserver = new ResizeObserver(() => {
      if (this.isDragging) {
        this.stopDragging(); // Stop dragging if container resizes
      }
    });

    this.resizeObserver.observe(this.thumbElement.nativeElement.parentElement);
  }

  private cleanupResizeObserver(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  ngOnInit(): void {
    this.validateAndUpdatePosition();
    this.updateAriaAttributes();
  }

  ngOnDestroy(): void {
    this.thumbMove.complete();
    this.dragEnd.complete();
    this.valueChange.complete();
    this.cleanupResizeObserver();

    if (this.isDragging) {
      document.removeEventListener('mousemove', this.boundMouseMove);
      document.removeEventListener('mouseup', this.boundMouseUp);
      document.removeEventListener('touchmove', this.boundTouchMove);
      document.removeEventListener('touchend', this.boundTouchEnd);
      document.removeEventListener('touchcancel', this.boundTouchEnd);
      this.stopDragging();
    }
  }

  private validateAndUpdatePosition(): void {
    const validPosition = this.validatePosition(this.position);
    if (validPosition !== this.position) {
      console.warn(
        `SliderThumb: Position value ${this.position} was clamped to ${validPosition}`
      );
      this.position = validPosition;
    }
  }

  private updateAriaAttributes(): void {
    if (!this.thumbElement?.nativeElement) return;
    const element = this.thumbElement.nativeElement;
    element.setAttribute('aria-valuenow', this._value.toString());
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
      role="presentation"
      aria-hidden="true"
    ></div>
  `,
})
export class SliderRangeComponent implements OnInit, OnDestroy {
  @Input() left = 0;
  @Input() width = 0;
  @Input() disabled = false;

  @ViewChild('rangeElement') rangeElement!: ElementRef<HTMLDivElement>;

  private animationState: 'idle' | 'moving' = 'idle';
  private readonly transitionDuration = 300; // Changed to 300ms as requested
  private animationTimeout?: number;

  calculateRangeStyle(): { [key: string]: string } {
    const { validLeft, validWidth } = this.validateRangePosition(
      this.left,
      this.width
    );

    return {
      left: `${validLeft}%`,
      width: `${validWidth}%`,
      transition: this.getTransitionStyle(),
      opacity: this.disabled ? '0.5' : '1',
    };
  }

  private validateRangePosition(
    left: number,
    width: number
  ): { validLeft: number; validWidth: number } {
    // Ensure values are numbers and within bounds
    const validLeft = Math.max(0, Math.min(100, isNaN(left) ? 0 : left));
    const validWidth = Math.max(
      0,
      Math.min(100 - validLeft, isNaN(width) ? 0 : width)
    );

    return { validLeft, validWidth };
  }

  private getTransitionStyle(): string {
    if (this.animationState === 'moving') {
      return 'none';
    }
    return `all ${this.transitionDuration}ms ease-out`;
  }

  updateRangePosition(newLeft: number, newWidth: number): void {
    // Clear any existing animation timeout
    if (this.animationTimeout) {
      window.clearTimeout(this.animationTimeout);
    }

    // Set to moving state to disable transitions
    this.animationState = 'moving';

    // Update position
    this.left = newLeft;
    this.width = newWidth;

    // Schedule return to idle state
    this.animationTimeout = window.setTimeout(() => {
      this.animationState = 'idle';
    }, 50); // Short delay to ensure smooth movement
  }

  ngOnInit(): void {
    // Initial validation
    const { validLeft, validWidth } = this.validateRangePosition(
      this.left,
      this.width
    );
    this.left = validLeft;
    this.width = validWidth;
  }

  ngOnDestroy(): void {
    // Clean up any pending animation timeouts
    if (this.animationTimeout) {
      window.clearTimeout(this.animationTimeout);
    }
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
      [class.opacity-50]="disabled"
      [class.cursor-pointer]="!disabled"
      (click)="onClick($event)"
      (mousedown)="onMouseDown($event)"
      role="presentation"
      aria-hidden="true"
    >
      <ng-content></ng-content>
    </div>
  `,
})
export class SliderTrackComponent implements OnInit, OnDestroy {
  @Input() disabled = false;
  @Output() trackClick = new EventEmitter<{
    position: number;
    thumbIndex: number;
  }>();
  @Output() trackDrag = new EventEmitter<{ position: number }>();
  @Output() trackDragEnd = new EventEmitter<void>();

  @ViewChild('trackElement') trackElement!: ElementRef<HTMLDivElement>;

  private isDragging = false;
  private boundMouseMove: (e: MouseEvent) => void;
  private boundMouseUp: () => void;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundMouseUp = this.onMouseUp.bind(this);
  }

  onClick(event: MouseEvent): void {
    if (this.disabled) return;

    const position = this.calculatePosition(event);
    // Find nearest thumb
    this.trackClick.emit({
      position,
      thumbIndex: 0, // Default to first thumb
    });
  }

  onMouseDown(event: MouseEvent): void {
    if (this.disabled || event.button !== 0) return;
    event.preventDefault();

    this.startDragging();
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);

    const position = this.calculatePosition(event);
    this.trackDrag.emit({ position });
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    event.preventDefault();

    if (event.buttons === 0) {
      this.onMouseUp();
      return;
    }

    const position = this.calculatePosition(event);
    this.trackDrag.emit({ position });
  }

  private onMouseUp(): void {
    this.stopDragging();
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
    this.trackDragEnd.emit();
  }

  private calculatePosition(event: MouseEvent): number {
    const rect = this.trackElement.nativeElement.getBoundingClientRect();
    return Math.max(
      0,
      Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)
    );
  }

  private startDragging(): void {
    if (this.isDragging) return;

    this.isDragging = true;
    document.body.style.userSelect = 'none';
    this.setupResizeObserver();
  }

  private stopDragging(): void {
    if (!this.isDragging) return;

    this.isDragging = false;
    document.body.style.userSelect = '';
    this.cleanupResizeObserver();
  }

  private setupResizeObserver(): void {
    if (!this.trackElement?.nativeElement) return;

    this.resizeObserver = new ResizeObserver(() => {
      if (this.isDragging) {
        this.stopDragging();
      }
    });

    this.resizeObserver.observe(this.trackElement.nativeElement);
  }

  private cleanupResizeObserver(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  ngOnInit(): void {
    // Initial setup if needed
  }

  ngOnDestroy(): void {
    this.cleanupResizeObserver();
    if (this.isDragging) {
      document.removeEventListener('mousemove', this.boundMouseMove);
      document.removeEventListener('mouseup', this.boundMouseUp);
      this.stopDragging();
    }
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
  @Input() step = 1;
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
      this.valueConversion.snapToStep(
        Math.max(this.min, Math.min(this.max, value)),
        this.min,
        this.max,
        this.step
      )
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

    // Update actual values with step
    const newValues = newPositions.map((pos) =>
      this.valueConversion.convertFromPercentage(
        pos,
        this.min,
        this.max,
        this.step
      )
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
    // Initial setup if needed
  }

  ngOnDestroy(): void {
    this.removeEventListeners();
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
