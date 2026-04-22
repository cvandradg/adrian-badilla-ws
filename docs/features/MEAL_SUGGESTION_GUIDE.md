# 🍽️ Meal Suggestion Feature Guide

## Overview

The meal suggestion feature automatically generates meal recommendations based on remaining daily macros. It's fully reactive using **Angular Signals** with **NO lifecycle hooks, NO effects, and NO constructor logic**.

---

## 📚 Architecture

### 1. **Food Blocks** (`meal-suggestion.utils.ts`)

A comprehensive list of 40+ real food items with accurate macros:

```ts
interface FoodBlock extends MealOption {
  category?: 'protein' | 'carbs' | 'fats' | 'mixed';
  servingSize?: string;
}
```

**Categories:**
- 🍗 Proteins (Chicken, Turkey, Tuna, Eggs, etc.)
- 🍚 Carbs (Rice, Bread, Oats, Sweet Potatoes, etc.)
- 🥑 Fats (Avocado, Oils, Nuts, etc.)
- 🥬 Vegetables (Broccoli, Spinach, etc.)
- 🍯 Mixed (Salmon, Yogurt, Almonds, etc.)

---

### 2. **Meal Generator Algorithm**

The `generateSuggestedMeal()` function:

1. **Analyzes remaining macros** from the daily goal
2. **Filters foods** that won't exceed remaining macros by >150%
3. **Sorts by relevance** (prioritizes the lowest macro percentage)
4. **Generates combinations** of 1-3 items iteratively
5. **Calculates match quality** with penalty for exceeding macros
6. **Returns best match** with quality descriptor

**Example Output:**
```ts
{
  items: [
    { name: 'Pollo (100g)', macros: { protein: 31, carbs: 0, fats: 3.6 } },
    { name: 'Arroz integral (100g cocido)', macros: { protein: 2.6, carbs: 23, fats: 0.9 } }
  ],
  totals: { protein: 33.6, carbs: 23, fats: 4.5 },
  nearestMatch: '✅ Coincidencia perfecta'
}
```

---

## 🔌 Store Integration

### Global Suggested Meal

```ts
// In with-macro-tracker.feature.ts
suggestedMeal: computed(() => {
  return generateSuggestedMeal(remaining);
});
```

**Usage in Component:**

```ts
import { settingsStoreDev } from '../../store/settings.store';

export class SomeComponent {
  private store = inject(settingsStoreDev);
  
  // Access the global suggestion
  suggestedMeal = this.store.suggestedMeal;
}
```

**In Template:**

```html
@if (suggestedMeal(); as meal) {
  <div class="suggested-meal">
    <h3>Sugerencia para ti: {{ meal.nearestMatch }}</h3>
    
    <div class="items">
      @for (food of meal.items; track food.name) {
        <div class="food-item">
          {{ food.name }}
        </div>
      }
    </div>
    
    <div class="macros">
      <span>🥩 {{ meal.totals.protein }}g</span>
      <span>🍞 {{ meal.totals.carbs }}g</span>
      <span>🥑 {{ meal.totals.fats }}g</span>
    </div>
  </div>
}
```

---

### Category-Specific Suggestions

```ts
// In store methods (called from component, still reactive)
getSuggestedMealByCategory(
  category: 'breakfast' | 'morning-snack' | 'lunch' | 'afternoon-snack' | 'dinner' | 'night-snack'
): SuggestedMeal
```

**Usage in Component:**

```ts
export class MealTimelineSection {
  private store = inject(settingsStoreDev);
  
  // Compute suggestion for this meal's category
  suggestedMeal = computed(() => {
    const category = signal('breakfast').value; // Know your category
    return this.store.getSuggestedMealByCategory(category);
  });
}
```

**Example in Template (Dropdown with Suggestions):**

```html
<div class="meal-options">
  <!-- SUGGESTED MEAL SECTION -->
  @if (suggestedMeal(); as suggested) {
    <div class="suggested-section">
      <h4>⭐ Sugerencia para ti</h4>
      <button (click)="selectSuggested(suggested)">
        @for (item of suggested.items; track item.name) {
          <span>{{ item.name }}</span>{{ $last ? '' : ' + ' }}
        }
        <br/>
        <small>
          🥩 {{ suggested.totals.protein }}g | 
          🍞 {{ suggested.totals.carbs }}g | 
          🥑 {{ suggested.totals.fats }}g
        </small>
      </button>
    </div>
  }
  
  <!-- DIVIDER -->
  <hr />
  
  <!-- PREDEFINED OPTIONS (existing code) -->
  @for (option of decisionOptions.balanced; track option.name) {
    <button>{{ option.name }}</button>
  }
</div>
```

---

## 🧮 Smart Constraints

The algorithm respects these rules:

1. **Avoid Exceeding by >150%**
   - Won't suggest a 40g carb item if only 20g carbs remain
   - Filters foods that would massively exceed targets

2. **Penalize Exceeding**
   - Exceeding a macro counts as 2x the difference
   - Deficiency counts as 1x the difference
   - Example: Going 10g over protein is worse than going 10g under

3. **Prioritize Lowest Macro**
   - Analyzes percentage of each macro relative to remaining
   - Prioritizes the one that needs most attention

4. **Category-Based Filtering**
   - **Breakfast**: Balanced options
   - **Morning/Afternoon Snacks**: Light, quick options (<200-300 cals)
   - **Lunch**: Any combination
   - **Dinner**: Lighter options (low carb emphasis)
   - **Night Snack**: Very light (<200 total cals)

---

## 🎯 Integration Pattern

### Step 1: Setup in Component

```ts
import { settingsStoreDev } from '../../store/settings.store';
import { signal } from '@angular/core';

@Component({
  selector: 'meal-dropdown',
  template: `...`
})
export class MealDropdownComponent {
  @Input() category!: MealCategory;
  private store = inject(settingsStoreDev);
  
  // Option 1: Use global suggestion
  globalSuggestion = this.store.suggestedMeal;
  
  // Option 2: Use category-specific suggestion
  categorySuggestion = computed(() => 
    this.store.getSuggestedMealByCategory(this.category)
  );
}
```

### Step 2: Handle Selection

```ts
selectSuggestedMeal(suggested: SuggestedMeal) {
  // Combine all items into a single MealOption
  const totalMacros = suggested.totals;
  const foodNames = suggested.items.map(f => f.name).join(' + ');
  
  const mealOption: MealOption = {
    name: foodNames,
    macros: totalMacros
  };
  
  // Emit to parent or call store method
  this.decisionChange.emit({
    id: this.mealId,
    decision: 'balanced', // auto-determined or user-selected
    option: mealOption,
    optionNameInSpanish: foodNames,
    optionNameInEnglish: foodNames,
  });
}
```

### Step 3: Auto-Update

Because `suggestedMeal` is a computed signal that reads from `store.meals()`, it **automatically updates** when:
- ✅ User selects any meal
- ✅ User changes meal decision
- ✅ Meal status changes
- ✅ Daily goals change

**NO manual refresh needed!**

---

## 🧪 Testing the Feature

### Quick Test in Component Template

```html
<!-- Display all suggestions for testing -->
<div class="debug-suggested-meals">
  <h3>Debug: Global Suggestion</h3>
  @if (store.suggestedMeal(); as meal) {
    <pre>{{ meal | json }}</pre>
  }
  
  <h3>Debug: Breakfast Suggestion</h3>
  <pre>{{ store.getSuggestedMealByCategory('breakfast') | json }}</pre>
</div>
```

### Unit Test Example

```ts
import { TestBed } from '@angular/core/testing';
import { settingsStoreDev } from './settings.store';
import { patchState } from '@ngrx/signals';

describe('Meal Suggestion Feature', () => {
  let store: typeof settingsStoreDev;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(settingsStoreDev);
  });

  it('should suggest meals based on remaining macros', () => {
    // Set some default meals as completed
    patchState(store, {
      meals: [
        { id: '1', status: 'completed', macros: { protein: 30, carbs: 50, fats: 10 } },
      ]
    });

    const suggestion = store.suggestedMeal();
    
    expect(suggestion).toBeDefined();
    expect(suggestion.items.length).toBeGreaterThan(0);
    expect(suggestion.totals.protein).toBeGreaterThan(0);
  });

  it('should return empty suggestion when all macros are complete', () => {
    // Set meals that complete all macros
    const goals = store.dailyGoals();
    patchState(store, {
      meals: [
        { id: '1', status: 'completed', macros: goals }
      ]
    });

    const suggestion = store.suggestedMeal();
    
    expect(suggestion.items.length).toBe(0);
    expect(suggestion.nearestMatch).toBe('Completado');
  });
});
```

---

## 🎨 UI/UX Best Practices

1. **Show Confidence Level**
   - ✅ Coincidencia perfecta → Highlight in green
   - 🎯 Muy cercana → Normal styling
   - 👍 Buena aproximación → Show with asterisk
   - 📊 Aproximación → Show with warning color

2. **Allow User Override**
   - Suggested meals should be optional
   - Always show predefined options
   - Suggestions above, predefined below (or in tabs)

3. **Real-Time Feedback**
   - Suggestion updates as user selects meals
   - Visual indication of "watching" macro progress
   - Maybe show "Updated just now" timestamp

4. **Mobile-Friendly**
   - Suggest meals should be compact on mobile
   - Full names might need abbreviation
   - Consider swipe/carousel for food items

---

## 🚀 Advanced Features (Future)

- [ ] User preferences (favorite foods, allergies)
- [ ] Historical suggestions (learn from past selections)
- [ ] Macro distribution targets (e.g., force 40/40/20 ratio)
- [ ] Integration with recipe API
- [ ] Custom food blocks per user
- [ ] Meal timing suggestions (what time to eat based on distribution)

---

## 📦 Files Modified/Created

- ✅ `libs/adrian-badilla/frontend/settings/src/lib/utils/meal-suggestion.utils.ts` - Core logic
- ✅ `libs/adrian-badilla/frontend/settings/src/lib/store/with-macro-tracker.feature.ts` - Store integration
- ✅ `libs/adrian-badilla/frontend/settings/src/lib/types/diet-decision.types.ts` - Type exports

---

## 🔍 Key Functions Reference

### `generateSuggestedMeal(remaining, foodBlocks?, maxItems?)`

Main entry point for global suggestions.

```ts
import { generateSuggestedMeal } from '../utils/meal-suggestion.utils';

const remaining = { protein: 50, carbs: 100, fats: 20 };
const suggestion = generateSuggestedMeal(remaining);
```

### `generateSuggestedMealForCategory(remaining, category)`

Category-specific suggestions with filtered food blocks.

```ts
const breakfastSuggestion = generateSuggestedMealForCategory(
  remaining,
  'breakfast'
);
```

---

## ⚡ Performance Notes

- **Computed signals** re-run only when `store.meals()` changes
- **Algorithm complexity**: O(n³) worst case (3-item combinations)
- **Optimization**: Limited to first 8-12 foods for n>2 combinations
- **No network calls**: All calculations are synchronous
- **No memory leaks**: Pure functions, no subscriptions

---

## 🐛 Debugging

Enable debug output in template:

```html
<!-- Show remaining macros -->
<div class="debug">
  Remaining: {{ store.remainingMacros | json }}
</div>

<!-- Show generated suggestion before applying -->
<div class="debug">
  Suggested: {{ store.suggestedMeal() | json }}
</div>
```

Check browser console for any errors during calculation.
