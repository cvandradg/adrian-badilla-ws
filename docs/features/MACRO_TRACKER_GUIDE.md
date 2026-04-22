# 📊 Macro Tracker - Guía de Implementación

## Descripción General

El Macro Tracker es una característica completa (feature) del Signal Store que permite:
- ✅ Calcular automáticamente macronutrientes consumidos diariamente
- ✅ Generar porcentajes de progreso en tiempo real
- ✅ Mostrar mensajes dinámicos personalizados
- ✅ Calcular calorías totales
- ✅ Validar objetivos alcanzados
- ✅ Interfaz reactiva sin RxJS innecesario

---

## Arquitectura

### 1. **Signal Store Feature** (`with-macro-tracker.feature.ts`)
Componente central que gestiona:
- **Estado**: Objetivos diarios y lista de comidas
- **Computed Properties**: Cálculos derivados que se recalculan automáticamente
- **Methods**: Acciones para actualizar estado y consultar datos

### 2. **Tipos TypeScript** (`diet-decision.types.ts`)
Interfaces completamente tipadas:
```typescript
interface MacroGoals {
  protein: number;
  fat: number;
  carbs: number;
}

interface MacroPercentage {
  percentage: number;      // 0-100+
  remaining: number;       // gramos
  exceeded: number;        // si pasó del objetivo
  isCompleted: boolean;
}

interface MacroSnapshot {
  goals: MacroGoals;
  consumed: { protein, fat, carbs };
  remaining: { protein, fat, carbs };
  percentages: { protein, fat, carbs, average };
  messages: MacroMessage[];
  isAllComplete: boolean;
  completedCount: number;
}
```

### 3. **Componente Visual** (`MacroProgressTrackerComponent`)
Muestra el progreso con:
- Progress bars visuales para cada macro
- Colores dinámicos basados en porcentaje
- Mensajes contextuales
- Información de calorías totales

---

## Uso en Componentes

### Opción 1: Usar el Componente Standalone

```typescript
import { MacroProgressTrackerComponent } from './components/macro-progress-tracker/macro-progress-tracker.component';

@Component({
  selector: 'app-diet-dashboard',
  standalone: true,
  imports: [MacroProgressTrackerComponent],
  template: `
    <lib-macro-progress-tracker 
      [showMessages]="true"
      [showCalories]="true"
      [compact]="false">
    </lib-macro-progress-tracker>
  `
})
export class DietDashboardComponent {}
```

### Opción 2: Acceder Directamente al Store

```typescript
import { inject } from '@angular/core';
import { settingsStoreDev } from './store/settings.store';

export class MyComponent {
  private store = inject(settingsStoreDev);

  // Acceder a signals computadas
  macroSnapshot = computed(() => this.store.macroSnapshot());
  messages = computed(() => this.store.macroMessages());
  totalCalories = computed(() => this.store.totalCalories());

  // Métodos del store
  isCompleted = () => this.store.areAllMacrosCompleted();
  getColor = (macro: 'protein' | 'fat' | 'carbs') => 
    this.store.getMacroColor(macro);
  getMessage = () => this.store.getProgressMessage();
}
```

---

## Computed Properties Disponibles

### `consumedMacros`
Totales consumidos:
```typescript
{
  protein: 85,
  fat: 42,
  carbs: 150
}
```

### `remainingMacros`
Gramajes restantes para completar objetivos:
```typescript
{
  protein: 35,
  fat: 18,
  carbs: 50
}
```

### `macroPercentages`
Porcentajes y estado de cada macro:
```typescript
{
  protein: { percentage: 70.8, remaining: 35, exceeded: 0, isCompleted: false },
  fat: { percentage: 70, remaining: 18, exceeded: 0, isCompleted: false },
  carbs: { percentage: 75, remaining: 50, exceeded: 0, isCompleted: false },
  average: { percentage: 71.9, remaining: 103, exceeded: 0, isCompleted: false }
}
```

### `macroSnapshot`
Vista completa consolidada (ideal para templates):
```typescript
{
  goals: { protein: 120, fat: 60, carbs: 200 },
  consumed: { protein: 85, fat: 42, carbs: 150 },
  remaining: { protein: 35, fat: 18, carbs: 50 },
  percentages: { /* ... */ },
  messages: [
    { macro: 'protein', text: 'Te faltan 35g de proteína', type: 'info' },
    // ...
  ],
  isAllComplete: false,
  completedCount: 0
}
```

### `macroMessages`
Mensajes dinámicos para el usuario:
```typescript
[
  { macro: 'protein', text: 'Te faltan 35g...', type: 'info' },
  { macro: 'fat', text: 'Has excedido grasas...', type: 'warning' },
  { macro: 'overall', text: '🔥 ¡Casi allá!...', type: 'info' },
]
```

### `totalCalories`
Calorías totales calculadas:
```typescript
1480 // kcal
```

---

## Métodos del Store

### `setDailyGoals(goals: Partial<MacroGoals>)`
Actualizar objetivos diarios:
```typescript
this.store.setDailyGoals({
  protein: 140,
  fat: 70,
  carbs: 220
});
```

### `updateMeals(meals: DietMeal[])`
Actualizar lista de comidas (se recalculan automáticamente):
```typescript
this.store.updateMeals(this.meals);
```

### `getMacroPercentage(macro: 'protein' | 'fat' | 'carbs')`
Obtener porcentaje de un macro específico:
```typescript
const proteinPercentage = this.store.getMacroPercentage('protein');
// { percentage: 70.8, remaining: 35, exceeded: 0, isCompleted: false }
```

### `isMacroCompleted(macro: 'protein' | 'fat' | 'carbs'): boolean`
Verificar si un macro está completado:
```typescript
if (this.store.isMacroCompleted('protein')) {
  // Mostrar indicador de éxito
}
```

### `areAllMacrosCompleted(): boolean`
Verificar si TODOS los macros están completados:
```typescript
if (this.store.areAllMacrosCompleted()) {
  this.celebrationAnimation();
}
```

### `getMacroColor(macro: 'protein' | 'fat' | 'carbs'): string`
Obtener color dinámico basado en progreso:
```typescript
// Retorna: '#ef4444' (rojo), '#eab308' (amarillo), '#22c55e' (verde)
const color = this.store.getMacroColor('protein');
```

### `getProgressMessage(): string`
Obtener mensaje amigable sobre progreso general:
```typescript
// '🎉 ¡Perfecto! Has completado todos tus macros'
// '🔥 ¡Casi allá! Debes completar un macro más'
const message = this.store.getProgressMessage();
```

### `resetMacros()`
Resetear estado de comidas para nuevo día:
```typescript
this.store.resetMacros();
```

---

## Lógica de Cálculo

### Fórmula de Porcentaje
```
porcentaje = (consumido / objetivo) × 100
```

### Mensaje de Exceso
Si `consumido > objetivo`, muestra `+{gramos_excedidos}g`

### Cálculo de Calorías
```
calorías = (proteína × 4) + (carbos × 4) + (grasas × 9)
```

### Colores Automáticos
- **< 50%**: Rojo (#ef4444) - Necesita más
- **50-99%**: Amarillo (#eab308) - En progreso
- **100-119%**: Verde (#22c55e) - Completado
- **> 120%**: Naranja (#f97316) - Excedido

---

## Validaciones y Seguridad

✅ **Evita valores negativos**: Usa `Math.max()` para restantes  
✅ **Redondea porcentajes**: A 1 decimal para precisión  
✅ **Tipado completo**: TypeScript strict mode  
✅ **Sin mutaciones**: Usa `patchState()` de NgRx  
✅ **Reactivo**: Solo recalcula cuando cambian meals o goals

---

## Ejemplo Completo

```typescript
import { Component, inject, computed } from '@angular/core';
import { settingsStoreDev } from './store/settings.store';
import { MacroProgressTrackerComponent } from './components/macro-progress-tracker/macro-progress-tracker.component';

@Component({
  selector: 'app-daily-summary',
  standalone: true,
  imports: [CommonModule, MacroProgressTrackerComponent],
  template: `
    <div class="summary">
      <h2>{{ progressMessage$ }}</h2>
      
      <lib-macro-progress-tracker 
        [showMessages]="true"
        [showCalories]="true">
      </lib-macro-progress-tracker>

      @if (isAllComplete()) {
        <button (click)="goToNextDay()">
          ¡Siguiente Día!
        </button>
      }
    </div>
  `
})
export class DailySummaryComponent {
  private store = inject(settingsStoreDev);

  progressMessage$ = computed(() => this.store.getProgressMessage());
  isAllComplete = computed(() => this.store.areAllMacrosCompleted());

  goToNextDay() {
    this.store.resetMacros();
  }
}
```

---

## Performance Optimizations

✅ **Signals**: Recalcula solo cuando cambia el estado  
✅ **Computed**: Cachea resultados internamente  
✅ **OnPush Detection**: Componente usa OnPush change detection  
✅ **No Observables**: Evita overhead de RxJS  
✅ **Lazy Calculation**: Las fórmulas se calculan bajo demanda

---

## Bonus Features

### Notificación al Completar
Emite evento o consolida cuando alcanza 100%:
```typescript
constructor() {
  effect(() => {
    if (this.store.areAllMacrosCompleted()) {
      this.playSound('success.mp3');
      this.showNotification('¡Completaste tus macros!');
    }
  });
}
```

### Historial Diario
Guarda snapshots en Firestore:
```typescript
const snapshot = this.store.macroSnapshot();
this.db.collection('daily-macros').doc(today).set(snapshot);
```

### Recomendaciones
Sugiere qué macro falta más:
```typescript
const remaining = this.store.macroSnapshot().remaining;
const lowest = Object.entries(remaining)
  .sort((a, b) => a[1] - b[1])[0][0];
// Alert: "Necesitas más proteína"
```

---

## FAQ

**Q: ¿Cómo actualizo los objetivos?**  
A: Usa `store.setDailyGoals({ protein: 140, ... })`

**Q: ¿Cómo reseteo para un nuevo día?**  
A: Usa `store.resetMacros()` o `store.updateMeals([])` 

**Q: ¿Qué pasa si como más de lo necesario?**  
A: Se muestra el exceeded en rojo y el porcentaje sigue creciendo > 100%

**Q: ¿Puedo usar esto sin el componente visual?**  
A: Sí, accede directamente a los computed del store

**Q: ¿Es reactivo en tiempo real?**  
A: Sí, cada cambio en meals recalcula automáticamente todos los computed

---

## Diagrama de Flujo

```
User selecciona comida
        ↓
updateMeals() → patchState
        ↓
consumedMacros computed se recalcula
        ↓
macroPercentages computed se recalcula
        ↓
macroMessages computed se genera
        ↓
macroSnapshot se actualiza
        ↓
Template se renderiza con nuevos valores
```
