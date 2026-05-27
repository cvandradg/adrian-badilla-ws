import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { settingsStoreDev } from '../../../store/settings.store';
import type { FoodDescriptionDialogData } from '../../../types/food-description.types';

@Component({
  selector: 'lib-food-description-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DividerModule,
    SkeletonModule,
    TagModule,
  ],
  templateUrl: './food-description-dialog.component.html',
  styleUrl: './food-description-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoodDescriptionDialogComponent {
  readonly settingsStore = inject(settingsStoreDev);
  private readonly dynamicDialogConfig = inject(DynamicDialogConfig);

  readonly vm = this.settingsStore.foodDescriptionVm;

  private readonly _initFoodDescriptionDialog =
    this.settingsStore.initializeFoodDescriptionDialog(
      this.dynamicDialogConfig.data as FoodDescriptionDialogData | undefined
    );
}
