import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  Injectable,
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
      class="absolute top-1/2 -translate-y-1/2 transform block h-4 w-4 rounded-full border-2 border-primary bg-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer disabled:pointer-events-none disabled:opacity-50"
      [ngStyle]="{ left: position + '%' }"
      (mousedown)="onMouseDown($event)"
      tabindex="0"
      role="slider"
      [attr.aria-label]="ariaLabel"
      [attr.aria-valuemin]="min"
      [attr.aria-valuemax]="max"
      [attr.aria-valuenow]="value"
    ></div>
  `,
})
export class SliderThumbComponent {
  @Input() position = 0;
  @Input() value = 0;
  @Input() min = 0;
  @Input() max = 100;
  @Input() ariaLabel = '';
  @Output() thumbMouseDown = new EventEmitter<MouseEvent>();

  onMouseDown(event: MouseEvent) {
    this.thumbMouseDown.emit(event);
  }
}

@Component({
  selector: 'app-slider-range',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="absolute h-full bg-primary"
      [ngStyle]="{
        left: left + '%',
        width: width + '%'
      }"
    ></div>
  `,
})
export class SliderRangeComponent {
  @Input() left = 0;
  @Input() width = 0;
}

@Component({
  selector: 'app-slider-track',
  standalone: true,
  imports: [CommonModule, SliderRangeComponent],
  template: `
    <div
      #trackElement
      class="relative h-1 w-full grow overflow-hidden rounded-full bg-[#7dd3fc]/50"
      (click)="onClick($event)"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
    >
      <app-slider-range [left]="rangeLeft" [width]="rangeWidth" />
    </div>
  `,
})
export class SliderTrackComponent {
  @Input() rangeLeft = 0;
  @Input() rangeWidth = 0;
  @Input() thumbPositions: [number, number] = [0, 0];
  @Output() trackClick = new EventEmitter<{
    position: number;
    thumbIndex: number;
  }>();
  @ViewChild('trackElement', { static: true })
  trackElement!: ElementRef<HTMLDivElement>;

  private isHovered = false;

  onClick(event: MouseEvent): void {
    const position = this.calculateClickPosition(event);
    const thumbIndex = this.findNearestThumbIndex(position);
    this.notifyParentOfClick(position, thumbIndex);
  }

  onMouseEnter(): void {
    this.isHovered = true;
  }

  onMouseLeave(): void {
    this.isHovered = false;
  }

  getTrackWidth(): number {
    return this.trackElement.nativeElement.offsetWidth;
  }

  getTrackBoundingRect(): DOMRect {
    return this.trackElement.nativeElement.getBoundingClientRect();
  }

  calculateClickPosition(event: MouseEvent): number {
    const rect = this.getTrackBoundingRect();
    const relativeX = event.clientX - rect.left;
    const percentage = (relativeX / rect.width) * 100;
    return Math.min(100, Math.max(0, percentage));
  }

  findNearestThumbIndex(clickPosition: number): number {
    const [leftThumbPos, rightThumbPos] = this.thumbPositions;

    const distanceToLeft = Math.abs(clickPosition - leftThumbPos);
    const distanceToRight = Math.abs(clickPosition - rightThumbPos);

    return distanceToLeft <= distanceToRight ? 0 : 1;
  }

  notifyParentOfClick(position: number, thumbIndex: number): void {
    if (position >= 0 && position <= 100) {
      this.trackClick.emit({ position, thumbIndex });
    }
  }

  notifyTrackReady(): void {
    // This could be used to notify parent when track is ready for interaction
    // Currently not needed but kept for future use
  }

  ngAfterViewInit(): void {
    if (this.trackElement) {
      this.notifyTrackReady();
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed in the future
  }
}

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule, SliderTrackComponent, SliderThumbComponent],
  template: `
    <div
      #track
      class="relative flex w-full touch-none select-none items-center"
    >
      <app-slider-track
        [rangeLeft]="getLeftPosition()"
        [rangeWidth]="getRangeWidth()"
        [thumbPositions]="_values"
        (trackClick)="onTrackClick($event)"
      />
      <app-slider-thumb
        *ngFor="let value of _values; let i = index"
        [position]="getThumbPosition(i)"
        [value]="_newValues[i]"
        [min]="min"
        [max]="max"
        [ariaLabel]="'Thumb ' + (i + 1)"
        (thumbMouseDown)="onThumbMouseDown(i, $event)"
      />
    </div>
  `,
})
export class SliderComponent {
  constructor(private valueConversion: ValueConversionService) {}

  @Input() min = 0;
  @Input() max = 100;
  @Input() set values(vals: [number, number]) {
    this._values = [
      this.valueConversion.convertToPercentage(vals[0], this.min, this.max),
      this.valueConversion.convertToPercentage(vals[1], this.min, this.max),
    ];
    this._newValues = [...vals];
  }
  get values(): [number, number] {
    return this._newValues;
  }
  @Output() valuesChange = new EventEmitter<[number, number]>();

  protected _values: [number, number] = [0, 0];
  protected _newValues: [number, number] = [0, 0];
  activeThumbIndex: number | null = null;

  @ViewChild('track', { static: true }) track!: ElementRef<HTMLDivElement>;

  onTrackClick(event: { position: number; thumbIndex: number }) {
    const { position, thumbIndex } = event;
    if (this.canMoveThumb(thumbIndex, position)) {
      this._values[thumbIndex] = position;
      this._newValues[thumbIndex] = this.valueConversion.convertFromPercentage(
        position,
        this.min,
        this.max
      );
      this.emitValues();
    }
  }

  onThumbMouseDown(index: number, event: MouseEvent) {
    event.preventDefault();
    this.activeThumbIndex = index;
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.activeThumbIndex = null;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.activeThumbIndex === null) return;

    const trackRect = this.track.nativeElement.getBoundingClientRect();
    const newPercent = Math.min(
      100,
      Math.max(0, ((event.clientX - trackRect.left) / trackRect.width) * 100)
    );

    if (this.canMoveThumb(this.activeThumbIndex, newPercent)) {
      this._values[this.activeThumbIndex] = newPercent;
      this._newValues[this.activeThumbIndex] =
        this.valueConversion.convertFromPercentage(
          newPercent,
          this.min,
          this.max
        );
      this.emitValues();
    }
  }

  private canMoveThumb(index: number, newPercent: number): boolean {
    if (index === 0) {
      return newPercent < this._values[1];
    } else {
      return newPercent > this._values[0];
    }
  }

  getThumbPosition(index: number): number {
    return this._values[index];
  }

  getLeftPosition(): number {
    return this._values[0];
  }

  getRangeWidth(): number {
    return this._values[1] - this._values[0];
  }

  private emitValues() {
    this.valuesChange.emit([...this._newValues] as [number, number]);
  }
}
