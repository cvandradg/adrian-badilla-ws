import {
  signalStoreFeature,
  withState,
  withComputed,
  withMethods,
  patchState
} from '@ngrx/signals';
import { computed, ChangeDetectorRef } from '@angular/core';
import { MOCK_MEALS, MEAL_OPTIONS_BY_CATEGORY } from '../mocks/diet-decision.mock';
import type { MealDecision, MealOption, DietMeal } from '../types/diet-decision.types';

type MealCategory =
  | 'breakfast'
  | 'morning-snack'
  | 'lunch'
  | 'afternoon-snack'
  | 'dinner'
  | 'night-snack';

type MealStatus = 'pending' | 'completed' | 'skipped';

const CONNECTOR_CLASS_MAP: Record<string, string> = {
  'light': 'completed-line',
  'balanced': 'balanced-line',
  'high-protein': 'skipped-line',
};

const CONNECTOR_COLOR_MAP: Record<string, string> = {
  'completed-line': '#22c55e',
  'skipped-line': '#ef4444',
  'balanced-line': '#eab308',
};

const DECISION_CLASS_MAP: Record<string, string> = {
  'light': 'decision-light',
  'balanced': 'decision-balanced',
  'high-protein': 'decision-protein',
};


// DEVUELVE LOS VALORES DE MACRONUTRIENTES RECOMENDADOS PARA CADA DECISIÓN DE COMIDA
function getMacrosByDecision(decision: string) {
  switch (decision) {
    case 'high-protein':
      return { protein: 35, carbs: 20, fats: 10 };
    case 'light':
      return { protein: 10, carbs: 15, fats: 5 };
    default:
      return { protein: 20, carbs: 30, fats: 10 };
  }
}

// Clasifica el tipo de comida basado en el nombre base para determinar las opciones de comida disponibles
function getMealCategoryFromBaseName(baseName: string): MealCategory {
  const lowerName = baseName.toLowerCase();
  
  if (lowerName.includes('desayuno')) return 'breakfast';
  if (lowerName.includes('mañana') || lowerName.includes('snack mañana')) return 'morning-snack';
  if (lowerName.includes('almuerzo') || lowerName.includes('comida')) return 'lunch';
  if (lowerName.includes('tarde') || lowerName.includes('snack tarde')) return 'afternoon-snack';
  if (lowerName.includes('cena') || lowerName.includes('noche')) return 'dinner';
  
  return 'night-snack';
}


// Ajusta automaticamente los macronutrientes de las comidas pendientes. Si quedan mas de 40g de proteina aumenta la proteina de las comidas pendientes en 10g
function adjustRemainingMealsFn(store: any) {
  const remaining = store.remainingMacros();

  const updated = store.meals().map((m: any) => {
    if (m.status !== 'pending') return m;

    if (remaining.protein > 40) {
      return {
        ...m,
        macros: {
          ...m.macros,
          protein: m.macros.protein + 10
        }
      };
    }

    return m;
  });

  patchState(store, { meals: updated });
}

export function withDietDecisionEngine() {
  return signalStoreFeature(
    // 🧠 STATE
    withState(() => ({
      meals: MOCK_MEALS,
      mealOptionsCatalog: MEAL_OPTIONS_BY_CATEGORY,
      dailyGoal: {
        protein: 120,
        carbs: 200,
        fats: 60
      }
    })),

    // suma los macronutrientes de todas las comidas marcadas como completed itera sobre comidas y acomula los valores de proteina, carbohidatos y grasa solo para quellas 
    // con estado complete
    withComputed((store) => ({
      consumedMacros: computed(() => {
        return store.meals().reduce(
          (acc, meal) => {
            if (meal.status === 'completed') {
              acc.protein += meal.macros.protein;
              acc.carbs += meal.macros.carbs;
              acc.fats += meal.macros.fats;
            }
            return acc;
          },
          { protein: 0, carbs: 0, fats: 0 }
        );
      })
    })),

    // calcukla cuantos macronutientes quedan para alcanzar las metas diarias. Resta los macronutrientes consumidos del objetivo diario
    withComputed((store) => ({
      remainingMacros: computed(() => {
        const consumed = store.consumedMacros();
        const goal = store.dailyGoal();

        return {
          protein: goal.protein - consumed.protein,
          carbs: goal.carbs - consumed.carbs,
          fats: goal.fats - consumed.fats
        };
      })
    })),

    // cambia el estado de una comida especifica " completa, saltada, pendiente ) busca la comida por id actualiza su estado sin afectar el resto."
    withMethods((store) => ({
      updateMealStatus(mealId: string, status: any) {
        const updated = store.meals().map((m) =>
          m.id === mealId ? { ...m, status } : m
        );

        patchState(store, { meals: updated });
      },

      // aplica una decision a una comida especifica actualizando su decision y macronutrinetes asociados, luego ajusta el resto de las comidas llamando
      // a abjustRemainingMerals()
      applyDecision(mealId: string, decision: any) {
        const updated = store.meals().map((m) => {
          if (m.id === mealId) {
            return {
              ...m,
              decision,
            };
          }
          return m;
        });

        patchState(store, { meals: updated });

        this.adjustRemainingMeals();
      },

      // es un getter que devuelve las opciones de comida disponibles para cada categoria especifica
      getDecisionOptionsForMeal(baseName: string): Record<MealDecision, MealOption[]> {
        const category = getMealCategoryFromBaseName(baseName);
        return store.mealOptionsCatalog()[category];
      },

      // aplica una opcion de comida seleccionada por el usuario, actualiza la comida con el 
      // alimento seleccionado, su nombre en ingles/español y los macronutrientes asociados
      // ✅ AUTO-MARCA COMO COMPLETADA CUANDO SE SELECCIONA
      applyMealDecision(event: {
        id: string;
        decision: MealDecision;
        option: MealOption;
        optionNameInSpanish: string;
        optionNameInEnglish: string;
      }) {
        const updated = store.meals().map((meal: any) => {
          if (meal.id === event.id) {
            const baseName = meal.baseName ?? meal.name;
            return {
              ...meal,
              baseName,
              decision: event.decision,
              name: baseName,
              selectedFoodName: event.option.name,
              selectedFoodNameInEnglish: event.optionNameInEnglish,
              selectedFoodDisplayName: event.optionNameInSpanish,
              // ✅ AUTO-MARCAR COMO 'completed' cuando se selecciona una opción
              status: 'completed',
              // ✅ REEMPLAZAR macros con la nueva opción
              macros: event.option.macros,
            };
          }
          return meal;
        });

        patchState(store, { meals: updated });
      },

      // es similar a adjustRemainingMealsFn pero implemetando como metodo del store.
      adjustRemainingMeals() {
        const remaining = store.remainingMacros();

        const updated = store.meals().map((m) => {
          if (m.status !== 'pending') return m;

          if (remaining.protein > 40) {
            return {
              ...m,
              macros: {
                ...m.macros,
                protein: m.macros.protein + 10
              }
            };
          }

          return m;
        });

        patchState(store, { meals: updated });
      },

      // convierte un objeto supercenter (del servidor) a un objeto DietMeal con toda la informacion necesaria, inclyyendo opciones de decision y macronutrientes
      mapToMeal(supercenter: any): DietMeal {
        const baseName = supercenter.baseName ?? supercenter.name;
        return {
          id: supercenter.id,
          baseName,
          name: supercenter.name,
          time: '08:00',
          status: supercenter.status ?? 'pending',
          decision: supercenter.decision ?? null,
          selectedFoodName: supercenter.selectedFoodName ?? null,
          decisionOptions: this.getDecisionOptionsForMeal(baseName),
          macros: supercenter.macros ?? { protein: 20, carbs: 30, fats: 10 }
        };
      },

      //! TIMELINE METHODS
      //actualiza las clases CSS  dffe los conectores visuales entre eventos del timeline, Primero seleciona todos los eventos del timeline DOM,
      // si no existen, vuelve a intentar en el siguiente frame de animacion, luego itera sobre cada evento, obtiene su conector visual, remueve las clases antiguas
      // añade las nuevas clases basada en el estado de la comida
      updateConnectorClasses() {
        const selectedRouteSupercenters = (store as any).selectedRouteSupercenters?.();
        if (!selectedRouteSupercenters) return;

        const list = selectedRouteSupercenters;
        const timelineEvents = document.querySelectorAll('.route-timeline .p-timeline-event');

        if (timelineEvents.length === 0) {
          requestAnimationFrame(() => this.updateConnectorClasses());
          return;
        }

        const updateEventClasses = (event: Element, i: number) => {
          if (i >= list.length - 1) return;

          const connector = event.querySelector('.p-timeline-event-connector');
          if (!connector) return;

          connector.classList.remove('completed-line', 'skipped-line', 'pending-line', 'balanced-line');

          const connectorClass = this.getConnectorClass(i);
          if (connectorClass) {
            connector.classList.add(connectorClass);
          }
        };

        timelineEvents.forEach(updateEventClasses);
      },

      // determina que clase CSS aplicar al connector entre dos eventos, si hay una comida saltada en comidas anteriores marca el conector como pendiente, si la comida actual
      // esta completao  saltada usa el color correspondiente. Si esta pendiente pero tiene una decision, usa la clase de la decision proteina equilibrado etc etc
      getConnectorClass(index: number): string {
        const selectedRouteSupercenters = (store as any).selectedRouteSupercenters?.();
        if (!selectedRouteSupercenters) return '';

        const list = selectedRouteSupercenters;
        if (index === list.length - 1) return '';

        const current = list[index];
        const hasErrorBefore = list.slice(0, index).some((i: any) => i.status === 'skipped');

        if (hasErrorBefore) return 'pending-line';
        if (current.status === 'completed' || current.status === 'skipped') {
          return current.status === 'completed' ? 'completed-line' : 'skipped-line';
        }

        return (current.status === 'pending' && current.decision)
          ? CONNECTOR_CLASS_MAP[current.decision] || 'pending-line'
          : 'pending-line';
      },

      // obtiene el color hexadecimal del connector consultando un mapa de colores basado en la clase del connector
      getConnectorColor(index: number): string {
        const connectorClass = this.getConnectorClass(index);
        return CONNECTOR_COLOR_MAP[connectorClass] || '#374151';
      },

      // añade animacion de pulso a los marcadores de comidas compeltadas o saltadas.
      getMarkerAnimationClass(item: any): string {
        return (item.status === 'completed' || item.status === 'skipped') ? 'pulse-marker' : '';
      },

      // construye un objeto de clases CSS dinamicas para cada marcador, incluyendo su estado, si es la sigueinte comida a compeltar y que tipo de decision tiene
      getMarkerClasses(item: any, index: number): any {
        const classes: any = {
          [item.status]: true,
          next: this.isNext(index),
        };

        if (item.status === 'pending' && item.decision) {
          classes[DECISION_CLASS_MAP[item.decision]] = true;
        }

        return classes;
      },

      // desplaza suavemente el elemento del tiemline al marcado especificado, centrandolo en la vista.
      scrollToIndex(index: number) {
        (document.querySelectorAll('.timeline-marker')[index] as HTMLElement)?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      },
      // encuentra el indice de la priemra comida que aun no ha sido compeltada.
      getNextPendingIndex(): number {
        const selectedRouteSupercenters = (store as any).selectedRouteSupercenters?.();
        if (!selectedRouteSupercenters) return -1;
        return selectedRouteSupercenters.findIndex((i: any) => i.status !== 'completed');
      },
      // verifica si una comida específica (por índice) es la siguiente pendiente de completar.
      isNext(index: number): boolean {
        return this.getNextPendingIndex() === index;
      },

      // calcula el % de progreso diviendo las comidas c ompletadas entre el total de comidas.
      getProgressPercent(index: number): string {
        const selectedRouteSupercenters = (store as any).selectedRouteSupercenters?.();
        if (!selectedRouteSupercenters) return '0%';

        const list = selectedRouteSupercenters;
        const completedCount = list.filter((i: any) => i.status === 'completed').length;
        const percent = (completedCount / list.length) * 100;
        return `${percent}%`;
      },

      // actualiza el estado de una comida y luego actualiza visualmente el timeline, despues de cambiar el estado, fuerza la detecccion de cambios angular, actualiza
      // los estilos de los connectores y desplaza a la siguiente comida pendiente.
      updateTimelineStatus(item: any, status: MealStatus, cdr: ChangeDetectorRef, fullStore?: any) {
        // Actualiza meals en el estado local del decision engine
        const updated = store.meals().map((meal: any) => 
          meal === item || meal.id === item.id ? { ...meal, status } : meal
        );
        
        patchState(store, { meals: updated });
        
        // Actualiza selectedRouteSupercenters en el full store si está disponible
        if (fullStore?.selectedRouteSupercenters) {
          patchState(fullStore, { selectedRouteSupercenters: updated });
        }
        
        cdr.detectChanges();

        const isNotCompleted = (i: any) => i.status !== 'completed';
        const updateUI = () => {
          this.updateConnectorClasses();
          const nextIndex = updated.findIndex(isNotCompleted);
          if (nextIndex !== -1) {
            this.scrollToIndex(nextIndex);
          }
        };

        requestAnimationFrame(updateUI);
      },
      // es un handler que recibe eventos de cambio de estado desde componentes  hijos, encuentra la comida correspondiente y llama updateMealStatus, despues
      // fuerza la actualizacion visual y sincroniza selectedRouteSupercenters.
      updateStatusFromChild(event: any, cdr: ChangeDetectorRef, fullStore?: any) {
        const item = store.meals().find((m) => m.id === event.id);
        if (item) {
          // Actualizar meals en el store
          this.updateMealStatus(event.id, event.status);
          
          // Sincronizar selectedRouteSupercenters con el nuevo estado
          // Acceder al feature de routes del store
          if (fullStore && typeof fullStore.selectedRouteSupercenters === 'function') {
            try {
              const currentSupercenters = fullStore.selectedRouteSupercenters();
              if (currentSupercenters && Array.isArray(currentSupercenters)) {
                const updated = currentSupercenters.map((m: any) =>
                  m.id === event.id ? { ...m, status: event.status } : m
                );
                patchState(fullStore, { selectedRouteSupercenters: updated });
              }
            } catch (err) {
              console.error('Error sincronizando selectedRouteSupercenters:', err);
            }
          }
          
          cdr.detectChanges();
        }
      }
    }))
  );
}