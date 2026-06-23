import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'adrian-badilla-app-section',
  templateUrl: './app-section.component.html',
  styleUrl: './app-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppSectionComponent {}
