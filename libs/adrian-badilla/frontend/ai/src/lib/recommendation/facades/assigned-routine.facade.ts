import { inject, Injectable } from '@angular/core';
import { map, Observable, of, switchMap, take } from 'rxjs';
import { AssignedRoutineRepository } from '../repositories/assigned-routine.repository';
import type { AssignedRoutine } from '../models/assigned-routine.model';
import { RoutineRecommendationFacade } from './routine-recommendation.facade';

@Injectable({ providedIn: 'root' })
export class AssignedRoutineFacade {
  readonly #recommendationFacade = inject(RoutineRecommendationFacade);
  readonly #assignedRoutineRepository = inject(AssignedRoutineRepository);

  assignTopRecommendedRoutineToUser(
    userId: string
  ): Observable<AssignedRoutine | null> {
    return this.#recommendationFacade
      .getTopRoutineRecommendationForUser(userId)
      .pipe(
        take(1),
        switchMap((recommendation) => {
          if (!recommendation) {
            return of(null);
          }

          return this.#assignedRoutineRepository
            .assignTopRecommendation(userId, recommendation)
            .pipe(
              switchMap((assignmentId) =>
                this.#assignedRoutineRepository
                  .getAssignedRoutineById(userId, assignmentId)
                  .pipe(take(1))
              )
            );
        })
      );
  }

  getActiveAssignedRoutine(userId: string): Observable<AssignedRoutine | null> {
    return this.#assignedRoutineRepository
      .getActiveAssignedRoutine(userId)
      .pipe(map((assignedRoutine) => assignedRoutine ?? null));
  }
}
