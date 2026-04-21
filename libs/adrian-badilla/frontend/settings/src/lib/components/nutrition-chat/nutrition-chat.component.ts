import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  viewChild,
  ElementRef,
  effect,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { settingsStoreDev } from '../../store/settings.store';
import type { ChatMessage } from '../../store/with-nutrition-chat.feature';

@Component({
  selector: 'lib-nutrition-chat',
  standalone: true,
  imports: [FormsModule, DatePipe, CommonModule, ButtonModule, InputTextModule, DialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './nutrition-chat.component.html',
  styleUrl: './nutrition-chat.component.scss',
})
export class NutritionChatComponent {
  readonly store = inject(settingsStoreDev);

  // Control whether to show the CTA button (default: true)
  showCtaButton = input<boolean>(true);

  messages = this.store.chatMessages;
  isLoading = this.store.chatIsLoading;
  isChatOpen = this.store.isChatOpen;
  inputText = signal('');

  private readonly messagesEnd = viewChild<ElementRef>('messagesEnd');

  quickActions = [
    { label: '🍽️ Sugerir comida', message: 'Sugiéreme una comida balanceada' },
    { label: '🥩 Alta proteína', message: 'Quiero comer algo proteico' },
    { label: '🥗 Ligero', message: 'Recomiéndame algo ligero' },
    { label: '📊 Ver macros', message: '¿Qué son los macronutrientes?' },
  ];

  constructor() {
    // Auto-scroll when messages change
    effect(() => {
      this.messages();
      this.isLoading();
      setTimeout(() => this.scrollToBottom(), 50);
    });
  }

  sendMessage(text?: string) {
    const content = text ?? this.inputText();
    if (!content.trim()) return;

    this.store.sendChatMessage(content);
    this.inputText.set('');
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  openChat() {
    this.store.openChat();
  }

  closeChat() {
    this.store.closeChat();
  }

  clearChat() {
    this.store.clearChat();
  }

  applyAISuggestion() {
    this.store.applyAISuggestionFromChat();
  }

  rejectAISuggestion() {
    this.store.rejectAISuggestionFromChat();
  }

  trackByTimestamp(_index: number, msg: ChatMessage) {
    return msg.timestamp;
  }

  private scrollToBottom() {
    const el = this.messagesEnd()?.nativeElement;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }
}
