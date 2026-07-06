# 🚀 Macro Tracker - Quick Reference

## Imports Rápidos

```typescript
import { settingsStoreDev } from '@libs/adrian-badilla/frontend/settings/src/lib/store';
import { MacroProgressTrackerComponent } from '@libs/adrian-badilla/frontend/settings/src/lib/components/macro-progress-tracker';
```

## Inyección del Store

```typescript
private store = inject(settingsStoreDev);
```

---

## Signals Rápidas

```typescript
// Estado actual
consumed = computed(() => this.store.consumedMacros());
remaining = computed(() => this.store.remainingMacros());

// Porcentajes
percentages = computed(() => this.store.macroPercentages());

// Vista completa
snapshot = computed(() => this.store.macroSnapshot());

// Mensajes
messages = computed(() => this.store.macroMessages());

// Calorías
calories = computed(() => this.store.totalCalories());
```

---

## Métodos Rápidos

```typescript
// Actualizar objetivos
this.store.setDailyGoals({ protein: 140, fat: 70, carbs: 220 });

// Actualizar comidas (recalcula todo)
this.store.updateMeals(meals);

// Consultas
const proteinObj = this.store.getMacroPercentage('protein');
const isComplete = this.store.isMacroCompleted('protein');
const allComplete = this.store.areAllMacrosCompleted();

// Colores dinámicos
const color = this.store.getMacroColor('protein'); // '#22c55e' | '#eab308' | '#ef4444'

// Mensajes
const msg = this.store.getProgressMessage();

// Reset
this.store.resetMacros();
```

---

## En Templates

```html
<!-- Usar el componente directamente -->
<lib-macro-progress-tracker 
  [showMessages]="true"
  [showCalories]="true"
  [compact]="false">
</lib-macro-progress-tracker>

<!-- O acceder a signals -->
<div class="progress-bar" [style.width.%]="macroPercentages().protein.percentage">
  {{ macroPercentages().protein.percentage | number:'1.1-1' }}%
</div>

<!-- Condicionales -->
@if ((isAllComplete$ | async)) {
  <p class="success">¡Completaste tus macros!</p>
}

<!-- Loops de mensajes -->
@for (msg of macroMessages(); track msg.macro) {
  <p [class]="'message-' + msg.type">{{ msg.text }}</p>
}
```

---

## Propiedades MacroSnapshot

```typescript
{
  goals: { protein: 120, fat: 60, carbs: 200 },
  consumed: { protein: 85, fat: 42, carbs: 150 },
  remaining: { protein: 35, fat: 18, carbs: 50 },
  percentages: {
    protein: { percentage: 70.8, remaining: 35, exceeded: 0, isCompleted: false },
    fat: { percentage: 70, remaining: 18, exceeded: 0, isCompleted: false },
    carbs: { percentage: 75, remaining: 50, exceeded: 0, isCompleted: false },
    average: { percentage: 71.9, remaining: 103, exceeded: 0, isCompleted: false }
  },
  messages: [
    { macro: 'protein', text: 'Te faltan 35g...', type: 'info' },
    { macro: 'overall', text: '🔥 ¡Casi allá!', type: 'info' }
  ],
  isAllComplete: false,
  completedCount: 0
}
```

---

## Colores por Porcentaje

| Rango | Color | Significado |
|-------|-------|-------------|
| 0-49% | 🔴 Rojo (#ef4444) | Necesita más |
| 50-99% | 🟡 Amarillo (#eab308) | En progreso |
| 100-119% | 🟢 Verde (#22c55e) | Completado ✓ |
| 120%+ | 🟠 Naranja (#f97316) | Excedido |

---

## Casos de Uso Comunes

### 1️⃣ Mostrar progreso general
```typescript
progress$ = computed(() => {
  const snap = this.store.macroSnapshot();
  return snap.percentages.average.percentage;
});
```

### 2️⃣ Mensaje cuando completa
```typescript
constructor() {
  effect(() => {
    if (this.store.areAllMacrosCompleted()) {
      alert(this.store.getProgressMessage());
    }
  });
}
```

### 3️⃣ Sugerir qué comer
```typescript
getMissingMacro() {
  const { remaining } = this.store.macroSnapshot();
  const [macro] = Object.entries(remaining)
    .sort((a, b) => a[1] - b[1])[0];
  return macro; // 'protein' | 'fat' | 'carbs'
}
```

### 4️⃣ Validar antes de guardar
```typescript
canFinishDay() {
  return this.store.areAllMacrosCompleted();
}
```

### 5️⃣ Persistir en Firestore
```typescript
saveDaySnapshot() {
  const snapshot = this.store.macroSnapshot();
  this.db.collection('macro-history')
    .doc(today)
    .set(snapshot);
}
```

---

## Archivos Relacionados

📁 **Feature Store**:
- [`with-macro-tracker.feature.ts`](libs/adrian-badilla/frontend/settings/src/lib/store/features/with-macro-tracker.feature.ts)

📁 **Tipos**:
- [`diet-decision.types.ts`](libs/adrian-badilla/frontend/settings/src/lib/types/diet-decision.types.ts)

📁 **Componente UI**:
- [`macro-progress-tracker.component.ts`](libs/adrian-badilla/frontend/settings/src/lib/components/macro-progress-tracker/macro-progress-tracker.component.ts)
- [`macro-progress-tracker.component.html`](libs/adrian-badilla/frontend/settings/src/lib/components/macro-progress-tracker/macro-progress-tracker.component.html)
- [`macro-progress-tracker.component.scss`](libs/adrian-badilla/frontend/settings/src/lib/components/macro-progress-tracker/macro-progress-tracker.component.scss)

📁 **Store Principal**:
- [`settings.store.ts`](libs/adrian-badilla/frontend/settings/src/lib/store/settings.store.ts)

---

## Debugging Tips 🔧

```typescript
// Ver el snapshot completo en consola
effect(() => {
  console.log('Macro Snapshot:', this.store.macroSnapshot());
});

// Ver cambios en mensajes
effect(() => {
  console.log('Messages:', this.store.macroMessages());
});

// Simular comidas teóricas
this.store.updateMeals([
  { 
    name: 'Pollo 200g',
    macros: { protein: 45, fat: 5, carbs: 0 },
    status: 'completed'
  }
]);

// Chequear porcentajes individuales
console.log(this.store.getMacroPercentage('protein'));
```

---

## Límites & Validaciones

✅ Valores negativos → `Math.max(0, value)`  
✅ Objetivo cero → Se ignora en cálculo  
✅ Comidas vacías → `macros = { protein: 0, fat: 0, carbs: 0 }`  
✅ Calorías exactas → `(p×4) + (c×4) + (f×9)`  
✅ Redondeo → A 1 decimal siempre  

---

## Changelog

- ✅ **v1.0** (Actual): Feature store completo con UI, validaciones, mensajes dinámicos
