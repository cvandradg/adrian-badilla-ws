import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'lib-chat-entry',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './chat-entry.component.html',
  styleUrl: './chat-entry.component.scss',
})
export class ChatEntryComponent {}
