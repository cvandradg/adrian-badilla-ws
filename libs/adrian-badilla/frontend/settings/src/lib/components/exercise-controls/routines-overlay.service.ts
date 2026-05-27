import { Injectable, ViewContainerRef, inject } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ExercisePopoverComponent } from './exercise-popover/exercise-popover.component';
import type { ExerciseMock } from '../../mock/exercises.mock';

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
   * Opens an exercise preview popover centered on the screen.
   * Closes any previously open popover first.
   * Calls `onClose` when the popover is dismissed (e.g. backdrop click).
   */
  open(
    origin: Element,
    exercise: ExerciseMock,
    vcr: ViewContainerRef,
    onClose: () => void
  ): void {
    this.close();

    // Use GlobalPositionStrategy with proper centering
    const positionStrategy = this.#overlay
      .position()
      .global()
      .centerHorizontally()
      .centerVertically();

    this.#activeRef = this.#overlay.create({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy: this.#overlay.scrollStrategies.block(),
      panelClass: 'exercise-overlay-panel',
    });

    this.#activeRef.backdropClick().subscribe(() => {
      this.close();
      onClose();
    });

    const portal = new ComponentPortal(ExercisePopoverComponent, vcr);
    const componentRef = this.#activeRef.attach(portal);
    componentRef.setInput('exercise', exercise);
    componentRef.setInput('onClose', () => {
      this.close();
      onClose();
    });
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
