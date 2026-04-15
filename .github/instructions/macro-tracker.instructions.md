---
applyTo: 'libs/adrian-badilla/frontend/settings/**'
---

# Macro Tracker Feature Documentation

This document provides guidelines for working with the Macro Tracker feature in the Settings library.

## Overview

The Macro Tracker is a complete Signal Store feature (v17+) that manages daily macronutrient tracking with:
- Automatic calculation of consumed macros
- Real-time percentage progress
- Dynamic messaging system
- Professional UI components
- Zero RxJS overhead (pure signals)

## Quick Start

### 1. Import Store in Your Component
```typescript
import { settingsStoreDev } from '@libs/adrian-badilla/frontend/settings/src/lib/store';

@Component({...})
export class MyComponent {
  private store = inject(settingsStoreDev);
}
```

### 2. Access Computed Properties
```typescript
// All auto-update when meals change
macroSnapshot = computed(() => this.store.macroSnapshot());
isComplete = computed(() => this.store.areAllMacrosCompleted());
calories = computed(() => this.store.totalCalories());
```

### 3. Use the Component (Optional)
```typescript
import { MacroProgressTrackerComponent } from '@libs/adrian-badilla/frontend/settings/src/lib/components/macro-progress-tracker';

@Component({
  standalone: true,
  imports: [MacroProgressTrackerComponent],
  template: `<lib-macro-progress-tracker [showMessages]="true"></lib-macro-progress-tracker>`
})
```

## File Structure

```
libs/adrian-badilla/frontend/settings/src/lib/
├── store/
│   ├── settings.store.ts              [Main store composition]
│   └── features/
│       ├── with-macro-tracker.feature.ts   [Feature implementation]
│       ├── with-diet-decision-engine.feature.ts
│       └── ... [other features]
├── components/
│   └── macro-progress-tracker/
│       ├── macro-progress-tracker.component.ts     [Standalone component]
│       ├── macro-progress-tracker.component.html   [Responsive template]
│       └── macro-progress-tracker.component.scss   [Professional styling]
└── types/
    └── diet-decision.types.ts         [Macro-related interfaces]
```

## API Reference

### State & Signals

#### `macroSnapshot` (Computed)
Complete view with all macro data - use this in templates:
```typescript
{
  goals: MacroGoals;              // Daily targets
  consumed: MacroGoals;            // What's been eaten
  remaining: MacroGoals;           // Still needed
  percentages: {                   // Progress per macro
    protein: MacroPercentage;
    fat: MacroPercentage;
    carbs: MacroPercentage;
    average: MacroPercentage;
  };
  messages: MacroMessage[];        // Dynamic messages
  isAllComplete: boolean;          // All macros ≥ 100%
  completedCount: number;          // How many are complete
}
```

#### `totalCalories` (Computed)
Total calculated calories: `(protein×4) + (carbs×4) + (fats×9)`

#### `macroMessages` (Computed)
Array of dynamic messages in Spanish about progress

### Methods

#### `setDailyGoals(goals: Partial<MacroGoals>)`
Update daily targets:
```typescript
this.store.setDailyGoals({ protein: 140, fat: 70, carbs: 220 });
```

#### `updateMeals(meals: DietMeal[])`
Update meal list - triggers all recalculations:
```typescript
this.store.updateMeals(selectedMeals);
```

#### `getMacroPercentage(macro: 'protein' | 'fat' | 'carbs'): MacroPercentage`
Get progress for specific macro

#### `isMacroCompleted(macro: string): boolean`
Check if macro is ≥100% of goal

#### `areAllMacrosCompleted(): boolean`
Check if ALL macros are complete

#### `getMacroColor(macro: string): string`
Get color based on percentage:
- Red (#ef4444) < 50%
- Yellow (#eab308) 50-99%
- Green (#22c55e) 100-119%
- Orange (#f97316) > 120%

#### `getProgressMessage(): string`
Get motivational message about overall progress

#### `resetMacros()`
Clear meals for new day

## Calculation Details

### Key Formulas

**Percentage**: `(consumed / goal) × 100`

**Remaining**: `Math.max(0, goal - consumed)`

**Exceeded**: Shows if `consumed > goal`

**Calories**: `(protein×4) + (carbs×4) + (fats×9)`

### Rounding & Validation
- All percentages rounded to 1 decimal
- All remaining values use `Math.max()` (never negative)
- Supports goals of 0 (no validation)
- Handles decimal consumed values correctly

## Component Props

```typescript
interface MacroProgressTrackerInputs {
  showMessages?: boolean;   // Display dynamic messages (default: true)
  showCalories?: boolean;   // Display total calories (default: false)
  compact?: boolean;        // Compact layout for small screens (default: false)
}
```

## Common Patterns

### Pattern 1: Show Alert When Complete
```typescript
constructor() {
  effect(() => {
    if (this.store.areAllMacrosCompleted()) {
      this.showSuccessNotification(this.store.getProgressMessage());
    }
  });
}
```

### Pattern 2: Suggest What to Eat
```typescript
getMissingMacro(): 'protein' | 'fat' | 'carbs' {
  const { remaining } = this.store.macroSnapshot();
  return Object.entries(remaining)
    .sort((a, b) => a[1] - b[1])[0][0] as any;
}
```

### Pattern 3: Persist Daily Snapshot
```typescript
saveDaySnapshot() {
  const today = new Date().toISOString().split('T')[0];
  this.db.collection('macro-history')
    .doc(today)
    .set(this.store.macroSnapshot());
}
```

### Pattern 4: Load Goals from User Preferences
```typescript
constructor() {
  this.userService.getGoals().pipe(
    tap(goals => this.store.setDailyGoals(goals)),
    takeUntilDestroyed()
  ).subscribe();
}
```

## Performance Notes

✅ **Signals-based**: Recalculates only when source changes  
✅ **Cached computeds**: Results cached until dependencies change  
✅ **OnPush detection**: Component uses OnPush for optimal rendering  
✅ **No subscriptions**: Pure computed properties, no memory leaks  
✅ **Batch updates**: Use `updateMeals()` for multiple changes  

## Type Safety

All types are exported from `diet-decision.types.ts`:
```typescript
import type {
  MacroGoals,        // { protein, fat, carbs }
  MacroPercentage,   // { percentage, remaining, exceeded, isCompleted }
  MacroSnapshot,     // Complete state view
  MacroMessage       // { macro, text, type }
} from '@libs/adrian-badilla/frontend/settings/src/lib/types';
```

## Debugging

Enable console logging to debug calculations:
```typescript
effect(() => {
  console.log('Snapshot:', this.store.macroSnapshot());
  console.log('Messages:', this.store.macroMessages());
  console.log('Calories:', this.store.totalCalories());
});
```

## Migration Guide

### From Manual Calculations
**Before**: Calculating macros in component
```typescript
// ❌ Manual, error-prone
const consumed = meals.reduce((sum, m) => sum + m.protein, 0);
```

**After**: Use store directly
```typescript
// ✅ Automatic, type-safe, reactive
const consumed = computed(() => this.store.consumedMacros().protein);
```

### From RxJS Observables
**Before**: Using Observables
```typescript
// ❌ Subscription management required
this.meals$.pipe(map(m => calculateMacros(m))).subscribe(...)
```

**After**: Pure signals
```typescript
// ✅ Automatic dependency tracking
macros = computed(() => this.store.consumedMacros());
```

## Testing

Unit tests for calculation functions should:
1. Test percentage calculation with various inputs
2. Test edge cases (goal = 0, consumed > goal, decimal values)
3. Test message generation for all types
4. Test color selection logic
5. Mock DietMeal objects

Example:
```typescript
it('should round percentage to 1 decimal', () => {
  const result = calculateMacroPercentage(85.333, 120);
  expect(result.percentage).toBe(71.1);
});
```

## References

- 📖 Full Guide: `MACRO_TRACKER_GUIDE.md`
- ⚡ Quick Reference: `MACRO_TRACKER_QUICK_REFERENCE.md`
- 📁 Feature File: `with-macro-tracker.feature.ts`
- 🎨 Component: `macro-progress-tracker.component.ts`
- 📋 Types: `diet-decision.types.ts`

## Changelog

- **v1.0** (Latest): Complete feature with calculations, UI, and messaging
-future: Add settings for macro goals persistence
- Future: Add historical tracking and charts
- Future: Add Spoonacular API integration for auto-detection

## Support

For questions about macro tracking:
1. Check `MACRO_TRACKER_GUIDE.md` for detailed explanations
2. Reference `MACRO_TRACKER_QUICK_REFERENCE.md` for common patterns
3. Review `with-macro-tracker.feature.ts` source code
4. Check `MacroProgressTrackerComponent` for UI implementation

Last Updated: 2024-Latest
