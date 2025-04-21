/// <reference types="jasmine" />

import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  inject,
} from '@angular/core/testing';
import { Component } from '@angular/core';
import { SliderRangeComponent } from './slider.component';

// Declare Jasmine test functions with proper types
declare function describe(
  description: string,
  specDefinitions: () => void
): void;
declare function beforeEach(action: () => void): void;
declare function it(description: string, action: () => void): void;
declare const expect: jasmine.ExpectStatic;
declare const spyOn: jasmine.Spy;

// Test host component to simulate parent
@Component({
  template: `
    <app-slider-range
      [left]="left"
      [width]="width"
      [disabled]="disabled"
      [color]="color"
      (rangeStateChange)="onStateChange($event)"
    ></app-slider-range>
  `,
})
class TestHostComponent {
  left = 20;
  width = 30;
  disabled = false;
  color = 'primary';
  stateChanged = false;

  onStateChange(state: boolean) {
    this.stateChanged = state;
  }
}

describe('SliderRangeComponent', () => {
  let component: SliderRangeComponent;
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestHostComponent],
      imports: [SliderRangeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    component = fixture.debugElement.children[0].componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Position Management', () => {
    it('should set initial positions correctly', () => {
      expect(component.left).toBe(20);
      expect(component.width).toBe(30);
    });

    it('should clamp positions within valid range', () => {
      hostComponent.left = 150;
      hostComponent.width = -10;
      fixture.detectChanges();

      const styles = component.calculateRangeStyle();
      expect(styles.left).toBe('100%');
      expect(styles.width).toBe('0%');
    });

    it('should prevent width from exceeding available space', () => {
      hostComponent.left = 70;
      hostComponent.width = 40;
      fixture.detectChanges();

      const styles = component.calculateRangeStyle();
      expect(styles.width).toBe('30%'); // 100 - 70 = 30 (max available width)
    });
  });

  describe('Visual Appearance', () => {
    it('should apply custom color when provided', () => {
      hostComponent.color = '#ff0000';
      fixture.detectChanges();

      const styles = component.calculateRangeStyle();
      expect(styles.backgroundColor).toBe('#ff0000');
    });

    it('should handle disabled state correctly', () => {
      hostComponent.disabled = true;
      fixture.detectChanges();

      const styles = component.calculateRangeStyle();
      expect(styles.pointerEvents).toBe('none');

      const element = fixture.nativeElement.querySelector('div');
      expect(element.classList.contains('opacity-50')).toBe(true);
    });
  });

  describe('Animations', () => {
    it('should apply transitions when position changes', fakeAsync(() => {
      hostComponent.left = 40;
      fixture.detectChanges();

      const styles = component.calculateRangeStyle();
      expect(styles.transition).toContain('150ms ease');

      tick(150); // Wait for animation
      fixture.detectChanges();

      const newStyles = component.calculateRangeStyle();
      expect(newStyles.transition).toBe('none');
    }));
  });

  describe('Accessibility', () => {
    it('should set correct ARIA attributes', () => {
      const element = fixture.nativeElement.querySelector('div');

      expect(element.getAttribute('role')).toBe('presentation');
      expect(element.getAttribute('aria-hidden')).toBe('true');
      expect(element.getAttribute('aria-valuenow')).toBe('30'); // Initial width
      expect(element.getAttribute('aria-valuemin')).toBe('0');
      expect(element.getAttribute('aria-valuemax')).toBe('100');
    });

    it('should update ARIA attributes when disabled', () => {
      hostComponent.disabled = true;
      fixture.detectChanges();

      const element = fixture.nativeElement.querySelector('div');
      expect(element.getAttribute('aria-disabled')).toBe('true');
    });
  });

  describe('State Changes', () => {
    it('should emit state changes when not disabled', () => {
      component.onRangeStateChange(true);
      expect(hostComponent.stateChanged).toBe(true);
    });

    it('should not emit state changes when disabled', () => {
      hostComponent.disabled = true;
      fixture.detectChanges();

      component.onRangeStateChange(true);
      expect(hostComponent.stateChanged).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('should complete event emitter on destroy', () => {
      const emitSpy = spyOn(component.rangeStateChange, 'complete');
      fixture.destroy();
      expect(emitSpy).toHaveBeenCalled();
    });
  });
});
