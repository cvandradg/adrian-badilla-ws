import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'adrian-badilla-announcement',
  standalone: true,
  templateUrl: './announcement.component.html',
  styleUrl: './announcement.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnouncementComponent {}
