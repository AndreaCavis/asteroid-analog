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
  HostListener,
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
    <span
      #thumb
      [class]="
        'block h-4 w-4 rounded-full border-2 border-primary bg-background absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 ' +
        (disabled ? 'pointer-events-none opacity-50 ' : '') +
        (isHovered ? 'scale-110' : '')
      "
      [style.left]="position + '%'"
      [style.transition]="'transform 0.3s ease-out, scale 0.3s ease-out'"
      role="slider"
      [attr.aria-label]="ariaLabel"
      [attr.aria-valuenow]="value"
      [attr.aria-disabled]="disabled"
      (mouseenter)="isHovered = !disabled"
      (mouseleave)="isHovered = false"
      tabindex="0"
    ></span>
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
    if (typeof newValue !== 'number' || !Number.isFinite(newValue)) {
      console.warn('SliderThumb: Invalid value, using 0 instead');
      newValue = 0;
    }

    // Only emit if value actually changed
    if (this._value !== newValue) {
      this._value = newValue;
      if (this.thumbElement?.nativeElement) {
        this.thumbElement.nativeElement.setAttribute(
          'aria-valuenow',
          this._value.toString()
        );
      }
      this.valueChange.emit(this._value);
    }
  }

  // @Output() thumbMove = new EventEmitter<{ clientX: number }>();
  @Output() positionChange = new EventEmitter<number>();
  @Output() dragEnd = new EventEmitter<void>();
  @Output() valueChange = new EventEmitter<number>();

  @ViewChild('thumb') thumbElement!: ElementRef<HTMLDivElement>;

  protected isHovered = false;
  private dragging = false;

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent): void {
    if (this.disabled) return;
    event.preventDefault();
    event.stopPropagation();

    this.dragging = true;
    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  onPointerMove = (event: PointerEvent): void => {
    if (!this.dragging) return;
    event.preventDefault();
    const newPosition = this.calculatePosition(event);
    this.positionChange.emit(newPosition);
  };

  onPointerUp = (): void => {
    if (!this.dragging) return;
    this.dragging = false;
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
    this.dragEnd.emit();
  };

  private calculatePosition(event: PointerEvent): number {
    const rect =
      this.thumbElement.nativeElement.parentElement?.getBoundingClientRect();
    if (!rect) return this.position;

    const newPosition = ((event.clientX - rect.left) / rect.width) * 100;
    return Math.max(0, Math.min(100, newPosition));
  }

  constructor() {}

  ngOnInit(): void {
    // Ensure position is valid
    this.position = Math.max(0, Math.min(100, this.position));
  }

  ngOnDestroy(): void {
    // this.thumbMove.complete();
    this.positionChange.complete();
    this.dragEnd.complete();
    this.valueChange.complete();
  }
}

@Component({
  selector: 'app-slider-range',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      #rangeElement
      class="absolute h-full bg-primary"
      [class.opacity-50]="disabled"
      [style.left]="left + '%'"
      [style.width]="width + '%'"
      role="presentation"
      aria-hidden="true"
    ></div>
  `,
})
export class SliderRangeComponent implements OnInit {
  @Input() left = 0;
  @Input() width = 0;
  @Input() disabled = false;

  @ViewChild('rangeElement') rangeElement!: ElementRef<HTMLDivElement>;

  ngOnInit(): void {
    // Ensure values are valid
    this.left = Math.max(0, Math.min(100, this.left));
    this.width = Math.max(0, Math.min(100 - this.left, this.width));
  }
}

@Component({
  selector: 'app-slider-track',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      #trackElement
      class="relative h-1 w-full rounded-full"
      [class.opacity-50]="disabled"
      [class.cursor-pointer]="!disabled"
      (click)="onClick($event)"
      role="presentation"
      aria-hidden="true"
    >
      <ng-content></ng-content>
    </div>
  `,
})
export class SliderTrackComponent {
  @Input() disabled = false;
  @Output() trackClick = new EventEmitter<{
    position: number;
    thumbIndex: number;
  }>();

  @ViewChild('trackElement') trackElement!: ElementRef<HTMLDivElement>;

  onClick(event: MouseEvent): void {
    if (this.disabled) return;

    const position = this.calculatePosition(event);
    // Find nearest thumb
    this.trackClick.emit({
      position,
      thumbIndex: 0, // Default to first thumb
    });
  }

  private calculatePosition(event: MouseEvent): number {
    const rect = this.trackElement.nativeElement.getBoundingClientRect();
    return Math.max(
      0,
      Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)
    );
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
    <div
      class="relative w-full rounded-full select-none px-2 bg-[#7dd3fc]/50"
      #track
    >
      <app-slider-track (trackClick)="onTrackClick($event)">
        <app-slider-range
          [left]="rangePosition().left"
          [width]="rangePosition().width"
        ></app-slider-range>
        <ng-container *ngFor="let value of currentValues(); let i = index">
          <app-slider-thumb
            [position]="thumbPositions()[i]"
            [value]="value"
            [ariaLabel]="'Slider thumb ' + (i + 1)"
            (positionChange)="onThumbPositionChange($event, i)"
            (dragEnd)="dragEnd.emit()"
          ></app-slider-thumb>
        </ng-container>
      </app-slider-track>
    </div>
  `,
})
export class SliderComponent implements OnInit {
  @Input() min = 0;
  @Input() max = 100;
  @Input() step = 1;
  @Output() valuesChange = new EventEmitter<[number, number]>();
  @Output() dragEnd = new EventEmitter<void>();

  private readonly _values: WritableSignal<[number, number]> = signal([0, 0]);
  private readonly _positions: WritableSignal<[number, number]> = signal([
    0, 0,
  ]);

  protected readonly currentValues = computed(() => this._values());
  protected readonly thumbPositions = computed(() => this._positions());
  protected readonly rangePosition = computed(() => ({
    left: this._positions()[0],
    width: this._positions()[1] - this._positions()[0],
  }));

  @ViewChild('track') trackElement!: ElementRef<HTMLElement>;

  constructor(private valueConversion: ValueConversionService) {
    effect(() => {
      const newValues = this.currentValues();
      const newPositions = newValues.map((value) =>
        this.valueConversion.convertToPercentage(value, this.min, this.max)
      );
      this._positions.set([newPositions[0], newPositions[1]]);
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

    this._values.set([validatedValues[0], validatedValues[1]]);
  }

  onThumbPositionChange(position: number, index: number): void {
    if (!this.trackElement) return;
    this.updateThumbPosition(index, position);
  }

  onTrackClick(event: { position: number; thumbIndex: number }): void {
    const { position } = event;
    const index = this.getClosestThumbIndex(position);
    this.updateThumbPosition(index, position);
  }

  private updateThumbPosition(index: number, position: number): void {
    if (index < 0 || index > 1) return;

    const currentPositions = this._positions();
    const newPositions = [...currentPositions];
    newPositions[index] = Math.max(0, Math.min(100, position));

    // Ensure thumbs don't cross
    if (index === 0 && newPositions[0] > newPositions[1]) {
      newPositions[0] = newPositions[1];
    } else if (index === 1 && newPositions[1] < newPositions[0]) {
      newPositions[1] = newPositions[0];
    }

    this._positions.set([newPositions[0], newPositions[1]] as [number, number]);

    // Update actual values with step
    const newValues = newPositions.map((pos) =>
      this.valueConversion.convertFromPercentage(
        pos,
        this.min,
        this.max,
        this.step
      )
    );
    this._values.set([newValues[0], newValues[1]] as [number, number]);
    this.emitValues();
  }

  private getClosestThumbIndex(position: number): number {
    const positions = this._positions();
    const distanceToFirst = Math.abs(positions[0] - position);
    const distanceToSecond = Math.abs(positions[1] - position);
    return distanceToFirst <= distanceToSecond ? 0 : 1;
  }

  private emitValues(): void {
    this.valuesChange.emit([this._values()[0], this._values()[1]]);
  }

  ngOnInit(): void {
    // Ensure initial values are set
    if (this._values()[0] === 0 && this._values()[1] === 0) {
      this._values.set([this.min, this.max]);
    }
  }
}
