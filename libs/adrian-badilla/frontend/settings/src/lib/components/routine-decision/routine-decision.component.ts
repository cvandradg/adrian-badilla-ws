import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import type { DecisionItem, MealStatus } from '../../types/diet-decision.types';
import { mapRoutineToDecisionItem, type Routine } from '../../adapters/decision-item.adapters';
import { DecisionCardComponent } from '../decision-card/decision-card.component';
import { ExerciseDropdownComponent } from '../with-routines/exercise-dropdown/exercise-dropdown.component';

@Component({
  selector: 'lib-routine-decision',
  standalone: true,
  imports: [DecisionCardComponent, ExerciseDropdownComponent],
  templateUrl: './routine-decision.component.html',
  styleUrl: './routine-decision.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutineDecisionComponent {
  readonly routine = input.required<Routine>();

  readonly statusChange = output<{ id: string; status: MealStatus }>();
  readonly openDetails = output<string>();
  readonly openChat = output<string>();

  readonly decisionItem = computed<DecisionItem>(() =>
    mapRoutineToDecisionItem(this.routine())
  );
}
