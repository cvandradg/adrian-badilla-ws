# Real-Time Recommendation Engine
## Smart Meal Suggestion System

A fully reactive meal recommendation engine using **pure signals** (no effects, no constructor, no ngOnInit).

---

## ✅ What You Get

### Computed Signals (Auto-Update)
- `recommendedMealType` → Current best meal type recommendation
- `feedbackMessage` → User-friendly guidance message

### Methods
- `getMealRecommendation(mealId: string)` → Recommendation for specific meal

---

## 🧠 How Recommendations Work

The system analyzes your daily macros and suggests the best meal type:

```
PRIORITY 1: If protein >= 100% → Avoid "proteico"
PRIORITY 2: If carbs are lowest macro → Recommend "balanceado"  
PRIORITY 3: If protein < 60% → STRONGLY recommend "proteico"
PRIORITY 4: If macros balanced ±10% → Recommend "balanceado"
PRIORITY 5: If calories near limit → Recommend "ligero"
DEFAULT: Analyze lowest macro and recommend accordingly
```

Confidence scores (0-100) show how strongly to recommend.

---

## 💻 Usage Examples

### Example 1: Global Recommendation in Component

```typescript
import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { settingsStoreDev } from '@libs/adrian-badilla/frontend/settings';

@Component({
  selector: 'app-meal-suggestion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="suggestion">
      <h3>{{ recommendation().reason }}</h3>
      <p [class]="'confidence--' + recommendation().confidence">
        Confianza: {{ recommendation().confidence }}%
      </p>
      <div [class]="'alert--' + feedback().type">
        {{ feedback().message }}
      </div>
    </div>
  `
})
export class MealSuggestionComponent {
  private store = inject(settingsStoreDev);
  
  // Auto-updates when meals change
  recommendation = computed(() => 
    this.store.recommendedMealType()
  );
  
  // Auto-updates with user-friendly message
  feedback = computed(() => 
    this.store.feedbackMessage()
  );
}
```

### Example 2: Highlight Recommended Button

```typescript
@Component({
  selector: 'app-meal-card',
  standalone: true,
  template: `
    <div class="meal-options">
      <button 
        class="meal-btn"
        [class.recommended]="isRecommended('light')"
        (click)="selectMeal('light')">
        🍜 Ligero
      </button>
      <button 
        class="meal-btn"
        [class.recommended]="isRecommended('balanced')"
        (click)="selectMeal('balanced')">
        🥗 Balanceado
      </button>
      <button 
        class="meal-btn"
        [class.recommended]="isRecommended('high-protein')"
        (click)="selectMeal('high-protein')">
        🥩 Proteico
      </button>
    </div>
  `
})
export class MealCardComponent {
  @Input() mealId!: string;
  private store = inject(settingsStoreDev);
  
  recommendation = computed(() => 
    this.store.getMealRecommendation(this.mealId)
  );
  
  isRecommended(type: string): boolean {
    return this.recommendation().type === type;
  }
  
  selectMeal(type: string) {
    // Your meal selection logic
  }
}
```

### Example 3: Responsive Recommendation Panel

```typescript
@Component({
  selector: 'app-recommendation-panel',
  standalone: true,
  template: `
    <div class="recommendation-panel">
      <!-- Header -->
      <div class="panel-header">
        <h2>Recomendación Inteligente</h2>
        <span class="confidence-badge" 
              [attr.aria-label]="'Confianza: ' + recommendation().confidence + '%'">
          {{ recommendation().confidence }}%
        </span>
      </div>

      <!-- Recommendation Type -->
      <div class="recommendation-type" [class]="'type--' + recommendation().type">
        <span class="type-icon">
          {{ getMealEmoji(recommendation().type) }}
        </span>
        <span class="type-name">
          {{ getMealName(recommendation().type) }}
        </span>
      </div>

      <!-- Reason -->
      <p class="reason">
        {{ recommendation().reason }}
      </p>

      <!-- Feedback Message -->
      <div class="feedback-message" [class]="'alert--' + feedback().type">
        {{ feedback().message }}
      </div>

      <!-- Macro Status -->
      <div class="macro-status">
        <div class="macro-item">
          <span class="macro-label">Proteína</span>
          <span class="macro-value">
            {{ macroPercentage('protein') }}%
          </span>
        </div>
        <div class="macro-item">
          <span class="macro-label">Carbos</span>
          <span class="macro-value">
            {{ macroPercentage('carbs') }}%
          </span>
        </div>
        <div class="macro-item">
          <span class="macro-label">Grasas</span>
          <span class="macro-value">
            {{ macroPercentage('fats') }}%
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .recommendation-panel {
      padding: 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      color: white;
    }
    
    .recommendation-type {
      font-size: 1.5rem;
      margin: 1rem 0;
      padding: 1rem;
      background: rgba(255,255,255,0.1);
      border-radius: 8px;
      text-align: center;
    }
    
    .recommendation-type.type--high-protein {
      background: rgba(239, 68, 68, 0.2);
    }
    
    .recommendation-type.type--balanced {
      background: rgba(234, 179, 8, 0.2);
    }
    
    .recommendation-type.type--light {
      background: rgba(34, 197, 94, 0.2);
    }
    
    .alert--warning { color: #fca5a5; }
    .alert--info { color: #bfdbfe; }
    .alert--success { color: #86efac; }
    
    .macro-status {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255,255,255,0.2);
    }
  `]
})
export class RecommendationPanelComponent {
  private store = inject(settingsStoreDev);
  
  // Fully reactive
  recommendation = computed(() => 
    this.store.recommendedMealType()
  );
  
  feedback = computed(() => 
    this.store.feedbackMessage()
  );
  
  snapshot = computed(() => 
    this.store.macroSnapshot()
  );
  
  getMealEmoji(type: string): string {
    const emojis: Record<string, string> = {
      'light': '🍜',
      'balanced': '🥗',
      'high-protein': '🥩'
    };
    return emojis[type] || '🍽️';
  }
  
  getMealName(type: string): string {
    const names: Record<string, string> = {
      'light': 'Ligero',
      'balanced': 'Balanceado',
      'high-protein': 'Proteico'
    };
    return names[type] || 'Comida';
  }
  
  macroPercentage(macro: 'protein' | 'carbs' | 'fats'): string {
    return Math.round(
      this.snapshot().percentages[macro].percentage
    ).toString();
  }
}
```

---

## 📊 Real-World Examples

### Scenario 1: User Needs Protein
```
Consumed: protein 30% | carbs 80% | fats 70%

Recommendation: "high-protein" (confidence: 95%)
Message: "🎯 Recomendación fuerte: considera una comida 
          proteica. Te falta bastante proteína, necesitas 
          una opción proteica"

Action: Highlight the "Proteico" button
```

### Scenario 2: Balanced Consumption
```
Consumed: protein 85% | carbs 82% | fats 84%

Recommendation: "balanced" (confidence: 90%)
Message: "🎯 Recomendación fuerte: mantén el equilibrio. 
          Tus macros están balanceados, mantén el equilibrio"

Action: Highlight the "Balanceado" button
```

### Scenario 3: Protein Complete
```
Consumed: protein 100% | carbs 50% | fats 75%

Recommendation: "balanced" (confidence: 85%)
Message: "💡 Sugerencia: una opción balanceado te 
          vendría bien. Enfócate en carbohidratos"

Action: Highlight the "Balanceado" button, note about carbs
```

### Scenario 4: Close to Calorie Limit
```
Consumed: 2200 calories of 2000 goal (~300 remaining)

Recommendation: "light" (confidence: 85%)
Message: "💡 Cuidado con las calorías, elige algo ligero. 
          Cuidado con las calorías"

Action: Highlight the "Ligero" button, show calorie warning
```

---

## 🎨 CSS Styling

```scss
// Recommendation confidence visual feedback
.confidence-badge {
  &[aria-label*="90"], 
  &[aria-label*="95"],
  &[aria-label*="100"] {
    color: #22c55e; // Strong
    font-weight: 700;
  }
  
  &[aria-label*="75"],
  &[aria-label*="80"],
  &[aria-label*="85"] {
    color: #eab308; // Medium
  }
  
  &[aria-label*="70"] {
    color: #f97316; // Lower
  }
}

// Meal type highlighting
.meal-btn {
  transition: all 0.3s ease;
  
  &.recommended {
    border: 3px solid currentColor;
    box-shadow: 0 0 12px rgba(99, 102, 241, 0.4);
    transform: scale(1.05);
    font-weight: 600;
  }
}

// Alert messages
.alert--warning {
  background-color: #fee2e2;
  border-left: 4px solid #ef4444;
  color: #991b1b;
  padding: 1rem;
}

.alert--info {
  background-color: #dbeafe;
  border-left: 4px solid #3b82f6;
  color: #1e40af;
  padding: 1rem;
}

.alert--success {
  background-color: #dcfce7;
  border-left: 4px solid #22c55e;
  color: #15803d;
  padding: 1rem;
}
```

---

## 🔄 How Updates Flow (Pure Signals)

```
1. User selects meal
   ↓
2. meals[] signal updates
   ↓
3. consumedMacros computed recalculates
   ↓
4. macroPercentages computed recalculates
   ↓
5. recommendedMealType computed runs logic
   ↓
6. feedbackMessage computed generates message
   ↓
7. Component computed signals re-evaluate
   ↓
8. Template updates automatically
   ↓
9. UI shows new recommendation (NO manual triggers needed)
```

**Zero effects. Zero subscriptions. Pure signals.**

---

## 🚀 Integration Checklist

- [ ] Import `settingsStoreDev` in your component
- [ ] Create `recommendation` computed signal
- [ ] Create `feedback` computed signal (optional)
- [ ] Display recommendation in template
- [ ] Highlight recommended meal button
- [ ] Style feedback message
- [ ] Test with different macro states
- [ ] Verify real-time updates when meals change

---

## 📝 API Reference

### `recommendedMealType: Computed<MealRecommendation>`

```typescript
interface MealRecommendation {
  type: 'light' | 'balanced' | 'high-protein'; // Spanish: ligero, balanceado, proteico
  reason: string;     // Why this recommendation
  confidence: number; // 0-100, higher = more confident
}
```

### `feedbackMessage: Computed<RecommendationFeedback>`

```typescript
interface RecommendationFeedback {
  message: string;                        // User-friendly message in Spanish
  type: 'success' | 'info' | 'warning';   // For styling
}
```

### `getMealRecommendation(mealId: string): MealRecommendation`

Returns the recommendation for a specific meal (validates ID exists).

---

## 💡 Pro Tips

1. **Confidence Tiers**: Use confidence score to determine button prominence
   - 90-100: Large highlight + animation
   - 75-89: Medium highlight
   - 70-74: Subtle highlight

2. **Message Types**: Use color/icon for feedback type
   - warning: 🎯 (high confidence)
   - info: 💡 (medium confidence)
   - success: ✨ (low confidence suggestion)

3. **Real-time Updates**: Because it's all computed signals, updates are instant
   - No need to call refresh methods
   - No polling
   - No manual triggers

4. **Responsive Design**: Show recommendation panel differently on mobile
   - Desktop: Full recommendation panel
   - Mobile: Just the type emoji + confidence badge

---

## 🧪 Testing Tips

```typescript
// Test recommendation logic
describe('Recommendation Engine', () => {
  it('should recommend high-protein when protein < 60%', () => {
    store.updateMeals([
      { ...meal, status: 'completed', macros: { protein: 20, carbs: 100, fats: 50 } }
    ]);
    
    const rec = store.recommendedMealType();
    expect(rec.type).toBe('high-protein');
    expect(rec.confidence).toBeGreaterThan(90);
  });
  
  it('should update recommendation instantly when meal added', (done) => {
    const initial = store.recommendedMealType();
    store.updateMeals([...store.meals(), newMeal]);
    
    // Next tick because computed updates are batched
    setTimeout(() => {
      const updated = store.recommendedMealType();
      expect(updated).not.toEqual(initial);
      done();
    }, 0);
  });
});
```

---

## ✨ That's It!

You now have a smart, reactive meal recommendation engine that:
- Updates in real-time
- Requires zero manual triggers
- Provides confidence-based suggestions
- Generates Spanish user messages
- Works with pure signals (no effects/subscriptions)

**Enjoy your smart meal recommendations! 🎉**
