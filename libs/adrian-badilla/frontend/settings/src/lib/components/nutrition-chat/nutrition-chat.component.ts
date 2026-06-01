import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  computed,
  inject,
  signal,
  viewChild,
  ElementRef,
  effect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { settingsStoreDev } from '../../store/settings.store';
import { FabLayoutStore } from '../../store/fab-layout.store';
import type { ChatMessage } from '../../store/with-nutrition-chat.feature';
import { TourFabComponent } from '../../guided-tour/components/tour-fab/tour-fab.component';

@Component({
  selector: 'lib-nutrition-chat',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    ButtonModule,
    InputTextModule,
    TourFabComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './nutrition-chat.component.html',
  styleUrl: './nutrition-chat.component.scss',
})
export class NutritionChatComponent {
  protected readonly store = inject(settingsStoreDev);
  readonly #fabLayout = inject(FabLayoutStore);
  private readonly messagesEnd = viewChild<ElementRef>('messagesEnd');
  private readonly destroyRef = inject(DestroyRef);

  // Chat open/close state
  readonly isChatOpen = signal<boolean>(false);

  // Store-derived signals
  readonly messages = this.store.chatMessages;
  readonly isLoading = this.store.chatIsLoading;
  readonly hasPendingAISuggestion = this.store.hasPendingAISuggestion;

  // Local state
  readonly inputText = signal<string>('');

  /**
   * CSS custom property value passed to the chat FAB button via
   * [style.--fab-bottom-base]. SCSS adds env(safe-area-inset-bottom) on top.
   * This is the lowest FAB in the stack, so it sits directly above the tracker.
   */
  readonly chatFabBottomBase = computed(
    () => `${this.#fabLayout.fabBaseBottom()}px`
  );

  // Quick action options
  readonly quickActions = [
    { label: '🍽️ Sugerir comida', message: 'Sugiéreme una comida balanceada' },
    { label: '🥩 Alta proteína', message: 'Quiero comer algo proteico' },
    { label: '🥗 Ligero', message: 'Recomiéndame algo ligero' },
    { label: '📊 Ver macros', message: '¿Qué son los macronutrientes?' },
  ] as const;

  /** Scroll to bottom whenever messages or loading state changes — no constructor needed. */
  readonly #scrollEffect = effect(() => {
    this.messages();
    this.isLoading();
    setTimeout(() => this.scrollToBottom(), 50);
  });

  // FAB toggle
  readonly toggleChat = () => this.isChatOpen.update((v) => !v);
  readonly closeChat = () => this.isChatOpen.set(false);

  /** Close on ESC key — replaces @HostListener, no constructor needed. */
  readonly #escapeCleanup = (() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.isChatOpen()) this.closeChat();
    };
    document.addEventListener('keydown', handler);
    this.destroyRef.onDestroy(() =>
      document.removeEventListener('keydown', handler)
    );
  })();

  // 💬 Send message
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

  // 🤖 AI suggestion actions
  readonly applyAISuggestion = () => this.store.applyAISuggestionFromChat();
  readonly rejectAISuggestion = () => this.store.rejectAISuggestionFromChat();

  // 🎯 Track messages by timestamp
  readonly trackByTimestamp = (_index: number, msg: ChatMessage): number =>
    msg.timestamp;

  private scrollToBottom(): void {
    const el = this.messagesEnd()?.nativeElement;
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }
}
