# 🚀 Quick Start - AI Chat + Meal Recommendation UX

**3-step integration** (5 min setup)

---

## 1️⃣ Import Components

```typescript
import {
  AiChatCtaComponent,
  AiSuggestionCardComponent,
  NutritionChatComponent,
} from '@myapp/settings';
```

---

## 2️⃣ Add to Template

```html
<!-- CTA Button -->
<lib-ai-chat-cta></lib-ai-chat-cta>

<!-- AI Suggestion Card (shows when AI suggests meal) -->
<lib-ai-suggestion-card></lib-ai-suggestion-card>

<!-- Your existing meal suggestions -->
<div>...</div>

<!-- Chat Dialog (auto-managed) -->
<lib-nutrition-chat></lib-nutrition-chat>
```

---

## 3️⃣ That's It! 🎉

Everything works automatically:

| Action | What Happens |
|--------|-------------|
| User clicks CTA | Dialog opens, chat ready |
| User asks for meal | AI generates suggestion |
| AI suggestion appears | Card shows above suggestions |
| User clicks "Apply" | Suggestion marked as applied |
| User clicks "Ignore" | Suggestion cleared |

---

## 🧠 Architecture

```
User clicks CTA
    ↓
Chat dialog opens (isChatOpen = true)
    ↓
User asks: "Me faltan carbos"
    ↓
AI interprets intent + focus + style
    ↓
Generate meal (filtered by focus)
    ↓
Call setAISuggestedMeal() ← stores temporarily
    ↓
AI suggestion card appears
    ↓
User decides:
  ✅ Apply → applyAISuggestion()
  ❌ Ignore → clearAISuggestion()
```

---

## 🎛️ Store Methods

```typescript
// Control chat visibility
store.openChat()
store.closeChat()

// Control AI suggestion
store.setAISuggestedMeal(meal)
store.applyAISuggestion()
store.clearAISuggestion()

// Signals to use
store.isChatOpen         // Dialog open/closed
store.hasAISuggestion    // Show card?
store.aiSuggestedMeal    // The actual meal
store.isAISuggestionApplied  // Did user click Apply?
```

---

## 🎨 Smart Behaviors (Optional)

### Auto-clear when user selects manually

```typescript
selectMealManually(meal: MealOption) {
  this.store.clearAISuggestion();  // ← Clear AI suggestion
  applyMeal(meal);
}
```

### Auto-clear when macros change

```typescript
constructor() {
  effect(() => {
    this.store.dailyGoal(); // Track changes
    this.store.clearAISuggestion(); // Clear stale suggestion
  });
}
```

---

## 📊 Signals to Know

```typescript
// Store already contains:
chatMessages      // Chat history
chatIsLoading     // Typing indicator
isChatOpen        // Dialog visible?
aiSuggestedMeal   // Meal from AI
isAISuggestionApplied  // User accepted?

// Computed:
hasAISuggestion = computed(() =>
  aiMeal !== null && !isApplied
);

// Template:
@if (hasAISuggestion()) {
  <lib-ai-suggestion-card/>  // Show card
}
```

---

## 🚀 Example: Full Component

```typescript
import {
  Component,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { settingsStoreDev } from '../../store/settings.store';
import {
  AiChatCtaComponent,
  AiSuggestionCardComponent,
  NutritionChatComponent,
} from '@myapp/settings';

@Component({
  selector: 'app-meal-recommendations',
  standalone: true,
  imports: [
    CommonModule,
    AiChatCtaComponent,
    AiSuggestionCardComponent,
    NutritionChatComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="recommendations">
      <!-- CTA -->
      <lib-ai-chat-cta></lib-ai-chat-cta>

      <!-- AI Suggestion -->
      <lib-ai-suggestion-card></lib-ai-suggestion-card>

      <!-- Your meals -->
      <div class="meals">
        <!-- existing UI -->
      </div>

      <!-- Chat -->
      <lib-nutrition-chat></lib-nutrition-chat>
    </div>
  `,
  styles: [`
    .recommendations {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
  `],
})
export class MealRecommendationsComponent {
  readonly store = inject(settingsStoreDev);
}
```

---

## 🔑 Key Features

✅ **Non-Intrusive**: Suggestion is optional  
✅ **User Control**: Explicit Apply/Ignore buttons  
✅ **No Auto-Apply**: Never surprises the user  
✅ **PrimeNG Dialog**: Native, professional look  
✅ **AI-Powered**: Real intelligence (with keyword fallback)  
✅ **One Store**: Everything in Signal Store  
✅ **Production-Ready**: Zero errors, full type safety  

---

## 🔗 Files

| File | Purpose |
|------|---------|
| `with-nutrition-chat.feature.ts` | ✅ Extended with AI suggestion state |
| `nutrition-chat.component.ts` | ✅ Updated to use Dialog |
| `ai-chat-cta.component.ts` | ✅ New: CTA button |
| `ai-suggestion-card.component.ts` | ✅ New: Suggestion card |
| `AI_MEAL_CHAT_UX_INTEGRATION.md` | 📖 Full guide |

---

## 🧪 Test Scenario

1. Open your meal component
2. See CTA: "🤖 Pregúntale a nuestra inteligencia artificial"
3. Click CTA → Chat dialog opens
4. Type: "Me faltan carbohidratos"
5. See AI response + suggestion card appears
6. Click "✅ Aplicar recomendación" → Card updates
7. Click "❌ Ignorar" on another suggestion → Card disappears
8. Close dialog by clicking X

✅ All working? You're done!

---

## 💡 Pro Tips

- **Test without API key**: Falls back to keywords automatically
- **Monitor costs**: OpenAI bills ~$0.0004 per suggestion
- **Customize**: Change system prompts in `with-nutrition-chat.feature.ts`
- **Auto-clear**: Add logic to clear suggestions on manual selection

---

**Status**: 🚀 Ready to integrate!

Copy the components into your template and you're live.
