import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FontScaleService,
  FONT_SCALE_OPTIONS,
} from '@adrian-badilla/ui/shared';

@Component({
  selector: 'lib-app-config-page',
  standalone: true,
  imports: [],
  templateUrl: './app-config-page.component.html',
  styleUrl: './app-config-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppConfigPageComponent {
  private readonly fontScale = inject(FontScaleService);

  readonly currentScale = this.fontScale.scale;
  readonly scaleOptions = FONT_SCALE_OPTIONS;

  setScale(value: number): void {
    this.fontScale.setScale(value);
  }
}
