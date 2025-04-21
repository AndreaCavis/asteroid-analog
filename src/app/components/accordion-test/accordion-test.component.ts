import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-slider',
  standalone: true,
  template: `
    <div
      #track
      class="relative flex w-full touch-none select-none items-center"
    >
      <ng-content></ng-content>
    </div>
  `,
})
export class SliderComponent {
  // Previous implementation remains...
  private _values: [number, number] = [0, 0];
  private _newValues: [number, number] = [0, 0];
  activeThumbIndex: number | null = null;

  // Add ViewChild for track reference
  @ViewChild('track', { static: true }) track!: ElementRef<HTMLDivElement>;

  // Event Handlers
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

    // Ensure the thumb doesn't cross over adjacent thumbs
    if (this.canMoveThumb(this.activeThumbIndex, newPercent)) {
      this._values[this.activeThumbIndex] = newPercent;
      this._newValues[this.activeThumbIndex] =
        this.convertFromPercentage(newPercent);
      this.emitValues();
    }
  }

  // Previous methods remain...
  @Input() min = 0;
  @Input() max = 100;
  @Output() valuesChange = new EventEmitter<[number, number]>();

  @Input() set values(vals: [number, number]) {
    this._values = [
      this.convertToPercentage(vals[0]),
      this.convertToPercentage(vals[1]),
    ];
    this._newValues = [...vals];
  }
  get values(): [number, number] {
    return this._newValues;
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

  private convertToPercentage(value: number): number {
    return ((value - this.min) / (this.max - this.min)) * 100;
  }

  private convertFromPercentage(percentage: number): number {
    return Math.round(this.min + (percentage / 100) * (this.max - this.min));
  }

  private emitValues() {
    this.valuesChange.emit([...this._newValues] as [number, number]);
  }
}
