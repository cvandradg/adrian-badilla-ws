import { Injectable, ViewContainerRef, inject } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ExercisePopoverComponent } from './exercise-popover/exercise-popover.component';

/**
 * RoutinesOverlayService
 *
 * Manages the CDK overlay lifecycle for exercise previews.
 * Provided at ExerciseDropdownComponent level — each dropdown instance
 * gets its own service instance so popovers are isolated.
 */
@Injectable()
export class RoutinesOverlayService {
  readonly #overlay = inject(Overlay);

  #activeRef: OverlayRef | null = null;

  /**
   * Opens an exercise preview popover anchored to the given origin element.
   * Closes any previously open popover first.
   * Calls `onClose` when the popover is dismissed (e.g. backdrop click).
   */
  open(
    origin: Element,
    exerciseName: string,
    videoUrl: string,
    vcr: ViewContainerRef,
    onClose: () => void,
  ): void {
    this.close();

    const positionStrategy = this.#overlay
      .position()
      .flexibleConnectedTo(origin)
      .withPositions([
        // Prefer right of icon, vertically centered
        { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 10 },
        // Fallback: left of icon
        { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -10 },
        // Fallback: below icon, aligned to left
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 6 },
        // Fallback: above icon
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -6 },
      ])
      .withFlexibleDimensions(false)
      .withPush(true);

    this.#activeRef = this.#overlay.create({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy: this.#overlay.scrollStrategies.reposition(),
    });

    this.#activeRef.backdropClick().subscribe(() => {
      this.close();
      onClose();
    });

    const portal = new ComponentPortal(ExercisePopoverComponent, vcr);
    const componentRef = this.#activeRef.attach(portal);
    componentRef.setInput('exerciseName', exerciseName);
    componentRef.setInput('videoUrl', videoUrl);
  }

  close(): void {
    if (this.#activeRef?.hasAttached()) {
      this.#activeRef.dispose();
    }
    this.#activeRef = null;
  }

  get isOpen(): boolean {
    return this.#activeRef?.hasAttached() ?? false;
  }
}
