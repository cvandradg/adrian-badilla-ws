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
import { DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { settingsStoreDev } from '../../store/settings.store';
import type { ChatMessage } from '../../store/with-nutrition-chat.feature';

/**
 * Nutrition chat component with auto-scroll and message management
 * Uses signals for reactive state management
 */
@Component({
  selector: 'lib-nutrition-chat',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    ButtonModule,
    InputTextModule,
    DialogModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './nutrition-chat.component.html',
  styleUrl: './nutrition-chat.component.scss',
})
export class NutritionChatComponent {
  protected readonly store = inject(settingsStoreDev);
  private readonly messagesEnd = viewChild<ElementRef>('messagesEnd');

  // Control whether to show the CTA button (default: true)
  readonly showCtaButton = input<boolean>(true);

  // Store-derived signals (direct exposure from store)
  readonly messages = this.store.chatMessages;
  readonly isLoading = this.store.chatIsLoading;
  readonly isChatOpen = this.store.isChatOpen;
  readonly hasPendingAISuggestion = this.store.hasPendingAISuggestion;

  // Local state
  readonly inputText = signal<string>('');

  // Quick action options
  readonly quickActions = [
    { label: '🍽️ Sugerir comida', message: 'Sugiéreme una comida balanceada' },
    { label: '🥩 Alta proteína', message: 'Quiero comer algo proteico' },
    { label: '🥗 Ligero', message: 'Recomiéndame algo ligero' },
    { label: '📊 Ver macros', message: '¿Qué son los macronutrientes?' },
  ] as const;

  constructor() {
    // Auto-scroll to bottom when messages change
    effect(() => {
      // Track dependencies
      this.messages();
      this.isLoading();
      // Schedule scroll after render
      setTimeout(() => this.scrollToBottom(), 50);
    });
  }

  // 💬 Send message action
  readonly sendMessage = (text?: string) => {
    const content = text ?? this.inputText();
    if (!content.trim()) return;

    this.store.sendChatMessage(content);
    this.inputText.set('');
  };

  // ⌨️ Handle Enter key
  readonly onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  };

  // 🗨️ Chat UI actions
  readonly openChat = () => this.store.openChat();
  readonly closeChat = () => this.store.closeChat();
  readonly clearChat = () => this.store.clearChat();

  // 🤖 AI suggestion actions
  readonly applyAISuggestion = () => this.store.applyAISuggestionFromChat();
  readonly rejectAISuggestion = () => this.store.rejectAISuggestionFromChat();

  // 🎯 Track messages by timestamp for *ngFor optimization
  readonly trackByTimestamp = (_index: number, msg: ChatMessage): number =>
    msg.timestamp;

  // Private helper: Scroll to messages end
  private scrollToBottom(): void {
    const el = this.messagesEnd()?.nativeElement;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }
}
