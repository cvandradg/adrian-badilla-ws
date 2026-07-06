import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * PendingPlanComponent
 *
 * Shown when the user IS premium but has no routine or diet generated yet.
 * Communicates that Adrián is working on their personalized plan.
 *
 * Visual: dark glassmorphism card with indigo accent.
 * Logic-free — purely presentational.
 */
@Component({
  selector: 'lib-pending-plan',
  standalone: true,
  templateUrl: './pending-plan.component.html',
  styleUrl: './pending-plan.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PendingPlanComponent {}
