import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
  viewChild,
  ElementRef,
  effect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TourFabComponent } from 'adrian-badilla/settings';
import { aiStore } from '../../store/ai.store';
import type { AiMessage } from '../../models/ai-message.model';
import type { PendingMealSuggestion } from '../../types/ai-chat.types';

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AiCoachChatComponent
 *
 * The AI Coach chat panel — migrated from NutritionChatComponent.
 * Same UX as before, but with a fully secure, enterprise architecture:
 *
 *  - Injects aiStore (Signal Store) for all chat state.
 *  - Accepts remainingMacros and fabBottomBase as inputs from the app shell.
 *  - NEVER calls OpenAI directly.
 *  - All AI communication goes: Component → AiStore → AiChatService → Firebase Function → OpenAI.
 *
 * Inputs:
 *  - remainingMacros: passed from the app shell (settingsStoreDev.remainingMacros()).
 *  - fabBottomBase:   passed from the app shell (FabLayoutStore.fabBaseBottom()).
 *
 * The component itself has no dependency on settingsStoreDev or FabLayoutStore,
 * keeping the AI lib fully decoupled.
 */
@Component({
  selector: 'lib-ai-coach-chat',
  standalone: true,
  imports: [FormsModule, DatePipe, ButtonModule, InputTextModule, TourFabComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ai-coach-chat.component.html',
  styleUrl: './ai-coach-chat.component.scss',
})
export class AiCoachChatComponent {
  protected readonly store = inject(aiStore);
  private readonly messagesEnd = viewChild<ElementRef>('messagesEnd');
  private readonly destroyRef = inject(DestroyRef);

  // ─── Inputs from app shell ─────────────────────────────────────────────────

  /** Remaining macros for today (from settingsStoreDev.remainingMacros()). */
  readonly remainingMacros =
    input<{ protein: number; carbs: number; fats: number } | null>(null);

  /**
   * FAB bottom offset in px (from FabLayoutStore.fabBaseBottom()).
   * CSS adds env(safe-area-inset-bottom) on top.
   */
  readonly fabBottomBase = input<number>(16);

  // ─── Local UI state ────────────────────────────────────────────────────────

  readonly isChatOpen = signal(false);
  readonly inputText = signal('');

  // ─── Store signals ─────────────────────────────────────────────────────────

  readonly messages = this.store.messages;
  readonly isLoading = this.store.chatLoading;
  readonly hasPendingMealSuggestion = this.store.hasPendingMealSuggestion;

  // ─── Computed ──────────────────────────────────────────────────────────────

  readonly chatFabBottomBase = computed(() => `${this.fabBottomBase()}px`);

  // ─── Quick actions ─────────────────────────────────────────────────────────

  readonly quickActions = [
    { label: '🍽️ Sugerir comida', message: 'Sugiéreme una comida balanceada' },
    { label: '🥩 Alta proteína', message: 'Quiero comer algo proteico' },
    { label: '🥗 Ligero', message: 'Recomiéndame algo ligero' },
    { label: '📊 Ver macros', message: '¿Qué son los macronutrientes?' },
  ] as const;

  // ─── Effects ──────────────────────────────────────────────────────────────

  /** Scrolls to bottom whenever messages or loading state changes. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private readonly _scrollEffect = effect(() => {
    this.messages();
    this.isLoading();
    setTimeout(() => this.#scrollToBottom(), 50);
  });

  /** Closes on ESC key. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private readonly _escapeCleanup = (() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.isChatOpen()) this.closeChat();
    };
    document.addEventListener('keydown', handler);
    this.destroyRef.onDestroy(() =>
      document.removeEventListener('keydown', handler)
    );
  })();

  // ─── Actions ──────────────────────────────────────────────────────────────

  readonly toggleChat = () => this.isChatOpen.update((v) => !v);
  readonly closeChat = () => this.isChatOpen.set(false);

  readonly sendMessage = (text?: string) => {
    const content = text ?? this.inputText();
    if (!content.trim()) return;

    this.store.sendMessage(content, {
      remainingMacros: this.remainingMacros() ?? null,
      activeMealId: this.store.activeMealId(),
    });

    this.inputText.set('');
  };

  readonly onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  };

  readonly applyMealSuggestion = (): PendingMealSuggestion | null =>
    this.store.applyMealSuggestion();

  readonly rejectMealSuggestion = () => this.store.rejectMealSuggestion();

  readonly trackByTimestamp = (_index: number, msg: AiMessage): number =>
    msg.timestamp;

  // ─── Private ──────────────────────────────────────────────────────────────

  #scrollToBottom(): void {
    const el = this.messagesEnd()?.nativeElement;
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }
}
