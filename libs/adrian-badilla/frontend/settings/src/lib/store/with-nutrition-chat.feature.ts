import {
  signalStoreFeature,
  withState,
  withComputed,
  withMethods,
  patchState,
} from '@ngrx/signals';
import { computed } from '@angular/core';
import type { MealMacro, MealOption } from '../types/diet-decision.types';
import {
  generateSuggestedMeal,
  FOOD_BLOCKS,
  type FoodBlock,
  type SuggestedMeal,
} from '../utils/meal-suggestion.utils';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

type ChatIntent = 'suggest_meal' | 'explain_macros' | 'food_info' | 'invalid';

type AIIntentType = 'suggest_meal' | 'food_info' | 'explain_macros' | 'invalid';
type MacroFocus = 'protein' | 'carbs' | 'fats' | 'none';
type MealStyle = 'light' | 'balanced' | 'high_protein' | 'low_carb';
type DecisionType = 'light' | 'balanced' | 'protein';

interface AIIntent {
  intent: AIIntentType;
  focus: MacroFocus;
  style: MealStyle;
}

interface NutritionChatState {
  chatMessages: ChatMessage[];
  chatIsLoading: boolean;
  isChatOpen: boolean;
  activeMealId: string | null;
  aiSuggestedMeal: SuggestedMeal | null;
  isAISuggestionApplied: boolean;
  pendingAISuggestion: { meal: SuggestedMeal; mealId: string } | null;
}

// ─── AI Configuration ────────────────────────────────────────────────────────

// ⚠️ IMPORTANT: Set your OpenAI API key here or use environment variable
// Option 1: Direct environment variable (recommended for production)
const OPENAI_API_KEY = (typeof globalThis !== 'undefined' && (globalThis as any).__NUTRITION_CHAT_API_KEY__)
  ? (globalThis as any).__NUTRITION_CHAT_API_KEY__
  : localStorage?.getItem?.('openai_api_key') || '';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// ─── AI Intent Detection (via LLM) ───────────────────────────────────────────

/**
 * 🧠 Use AI to interpret user intent and extract structured data
 * Returns simplified intent + macro focus + meal style preference
 */
async function interpretWithAI(message: string): Promise<AIIntent> {
  // If no API key, fall back to keyword detection
  if (!OPENAI_API_KEY) {
    return interpretWithKeywords(message);
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a nutrition assistant inside a diet app. 
Your job is to understand user intent and return ONLY valid JSON with no additional text.

Return JSON matching this structure:
{
  "intent": "suggest_meal" | "food_info" | "explain_macros" | "invalid",
  "focus": "protein" | "carbs" | "fats" | "none",
  "style": "light" | "balanced" | "high_protein" | "low_carb"
}

Rules:
- Detect if user wants food suggestion or meal ("comer", "comida", "meal", "sugerir")
- Detect if they mention specific macros or foods ("proteina", "pollo", "carbs")
- Detect meal style preferences ("ligero"=light, "proteico"=high_protein, "bajo carb"=low_carb)
- If asking about macros generally, set intent to "explain_macros"
- If asking about a specific food, set intent to "food_info"
- Default intent to "invalid" if unclear
- NEVER include explanations, ONLY return the JSON object`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.3,
        max_tokens: 150,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.warn('AI intent detection failed:', data?.error?.message);
      return interpretWithKeywords(message);
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return interpretWithKeywords(message);
    }

    // Extract JSON from response (might be wrapped in backticks or text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return interpretWithKeywords(message);
    }

    const parsed = JSON.parse(jsonMatch[0]) as AIIntent;
    
    // Validate required fields
    if (parsed.intent && parsed.focus && parsed.style) {
      return parsed;
    }

    return interpretWithKeywords(message);
  } catch (error) {
    console.warn('AI API error, falling back to keywords:', error);
    return interpretWithKeywords(message);
  }
}

/**
 * 🔑 Fallback keyword-based intent detection (when AI unavailable)
 */
function interpretWithKeywords(message: string): AIIntent {
  const lower = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Check for food-specific query first
  const matchedFood = findFoodInMessage(message);
  if (matchedFood) {
    return {
      intent: 'food_info',
      focus: 'none',
      style: 'balanced',
    };
  }

  // Check for meal suggestion
  const suggestKeywords = ['comer', 'comida', 'meal', 'sugerir', 'sugiere', 'recomienda', 
                           'hambre', 'snack', 'desayuno', 'almuerzo', 'cena'];
  const isSuggestMeal = suggestKeywords.some(kw => {
    const normalized = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return lower.includes(normalized);
  });

  // Detect macro focus
  let focus: 'protein' | 'carbs' | 'fats' | 'none' = 'none';
  if (lower.includes('proteina') || lower.includes('proteína') || lower.includes('protein')) {
    focus = 'protein';
  } else if (lower.includes('carb') || lower.includes('carbohidrato')) {
    focus = 'carbs';
  } else if (lower.includes('grasa') || lower.includes('fats') || lower.includes('fat')) {
    focus = 'fats';
  }

  // Detect meal style preference
  let style: 'light' | 'balanced' | 'high_protein' | 'low_carb' = 'balanced';
  if (lower.includes('proteico') || lower.includes('protein') || lower.includes('proteina')) {
    style = 'high_protein';
  } else if (lower.includes('ligero') || lower.includes('light') || lower.includes('liviano')) {
    style = 'light';
  } else if (lower.includes('bajo carb') || lower.includes('low carb')) {
    style = 'low_carb';
  }

  if (isSuggestMeal) {
    return {
      intent: 'suggest_meal',
      focus,
      style,
    };
  }

  // Check for macro explanation
  const macroKeywords = ['macro', 'nutrient', 'proteina', 'carb', 'grasa', 'caloria'];
  const isMacroQuestion = macroKeywords.some(kw => {
    const normalized = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return lower.includes(normalized);
  });

  if (isMacroQuestion) {
    return {
      intent: 'explain_macros',
      focus: 'none',
      style: 'balanced',
    };
  }

  return {
    intent: 'invalid',
    focus: 'none',
    style: 'balanced',
  };
}

/**
 * 🔍 Filter foods by macro focus to narrow down suggestions
 */
function filterByFocus(foods: FoodBlock[], focus: MacroFocus): FoodBlock[] {
  if (focus === 'none') return foods;
  
  switch (focus) {
    case 'protein':
      return foods.filter(f => f.macros.protein >= 10);
    case 'carbs':
      return foods.filter(f => f.macros.carbs >= 15);
    case 'fats':
      return foods.filter(f => f.macros.fats >= 8);
    default:
      return foods;
  }
}

/**
 * 🎯 Map AI style preference to meal generation type
 */
function mapDecision(style: MealStyle): DecisionType {
  switch (style) {
    case 'high_protein':
      return 'protein';
    case 'light':
      return 'light';
    case 'low_carb':
      return 'protein';
    default:
      return 'balanced';
  }
}

/**
 * 📂 Get category label for food
 */
function getCategoryLabel(food: FoodBlock): string {
  switch (food.category) {
    case 'protein':
      return 'Proteína';
    case 'carbs':
      return 'Carbohidratos';
    case 'fats':
      return 'Grasas';
    default:
      return 'Mixto';
  }
}

// ─── AI Response Formatting ──────────────────────────────────────────────────

/**
 * 🤖 Use AI to format meal suggestion with natural explanation
 * Explains why this meal helps and mentions macros briefly
 */
async function formatWithAI(meal: any, userMessage: string): Promise<string> {
  // If no API key, use simple format
  if (!OPENAI_API_KEY) {
    return formatMealSimple(meal);
  }

  try {
    const itemsList = meal.items.map((item: any) => item.name).join(', ');
    const cals = Math.ceil(meal.totals.protein * 4 + meal.totals.carbs * 4 + meal.totals.fats * 9);

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a friendly nutrition assistant inside a diet app.
User asked: "${userMessage}"

Suggested meal: ${itemsList}
Macros: Protein ${Math.ceil(meal.totals.protein)}g, Carbs ${Math.ceil(meal.totals.carbs)}g, Fats ${Math.ceil(meal.totals.fats)}g (~${cals} kcal)

Write a SHORT, natural explanation (2-3 sentences in Spanish) about why this meal helps, mentioning why these macros matter for them.
Be friendly and concise. Use emoji. Do NOT list the foods again.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.warn('AI formatting failed:', data?.error?.message);
      return formatMealSimple(meal);
    }

    const explanation = data?.choices?.[0]?.message?.content;
    if (!explanation) {
      return formatMealSimple(meal);
    }

    // Build response with AI explanation
    return formatMealWithExplanation(meal, explanation);
  } catch (error) {
    console.warn('AI formatting error, using simple format:', error);
    return formatMealSimple(meal);
  }
}

// ─── Intent Detection & Keyword Lookup ───────────────────────────────────────

function findFoodInMessage(message: string): FoodBlock | null {
  const lower = message.toLowerCase();
  for (const food of FOOD_BLOCKS) {
    const baseName = food.name.split('(')[0].trim().toLowerCase();
    if (baseName.length >= 3 && lower.includes(baseName)) {
      return food;
    }
  }
  return null;
}

// ─── Response Formatters ─────────────────────────────────────────────────────

function formatMealWithExplanation(meal: any, explanation: string): string {
  const itemsList = meal.items
    .map((item: any) => `• ${item.name}`)
    .join('\n');

  const cals = Math.ceil(meal.totals.protein * 4 + meal.totals.carbs * 4 + meal.totals.fats * 9);

  return [
    `🍽️ **Comida sugerida**:`,
    '',
    itemsList,
    '',
    `💭 ${explanation}`,
    '',
    '📊 Macros de esta comida:',
    `  🥩 Proteína: ${Math.ceil(meal.totals.protein)}g`,
    `  🍚 Carbohidratos: ${Math.ceil(meal.totals.carbs)}g`,
    `  🥑 Grasas: ${Math.ceil(meal.totals.fats)}g`,
    `  🔥 Calorías: ~${cals} kcal`,
    '',
    `${meal.nearestMatch}`,
  ].join('\n');
}

function formatMealSimple(meal: any): string {
  if (meal.items.length === 0) {
    return '✅ ¡Tus macros del día ya están completos! No necesitas comer más.';
  }

  const itemsList = meal.items
    .map((item: any) => `• ${item.name}`)
    .join('\n');

  const cals = Math.ceil(meal.totals.protein * 4 + meal.totals.carbs * 4 + meal.totals.fats * 9);

  return [
    `🍽️ Te recomiendo esta opción:`,
    '',
    itemsList,
    '',
    '📊 Macros de esta comida:',
    `  Proteína: ${Math.ceil(meal.totals.protein)}g`,
    `  Carbohidratos: ${Math.ceil(meal.totals.carbs)}g`,
    `  Grasas: ${Math.ceil(meal.totals.fats)}g`,
    `  Calorías: ~${cals} kcal`,
    '',
    `${meal.nearestMatch}`,
  ].join('\n');
}

function formatMealSuggestion(remaining: MealMacro, decision: 'light' | 'balanced' | 'protein'): string {
  const meal = generateSuggestedMeal(remaining, FOOD_BLOCKS, 3, decision);
  return formatMealSimple(meal);
}

// ─── Feature ─────────────────────────────────────────────────────────────────

export function withNutritionChat() {
  return signalStoreFeature(
    withState<NutritionChatState>({
      chatMessages: [],
      chatIsLoading: false,
      isChatOpen: false,
      activeMealId: null,
      aiSuggestedMeal: null,
      isAISuggestionApplied: false,
      pendingAISuggestion: null,
    }),

    withComputed((store) => ({
      chatMessageCount: computed(() => store.chatMessages().length),
      lastChatMessage: computed(() => {
        const msgs = store.chatMessages();
        return msgs.length > 0 ? msgs[msgs.length - 1] : null;
      }),
      hasAISuggestion: computed(() => {
        return store.aiSuggestedMeal() !== null && !store.isAISuggestionApplied();
      }),
      hasPendingAISuggestion: computed(() => {
        return store.pendingAISuggestion() !== null;
      }),
    })),

    withMethods((store) => ({
      /** Add a raw message to history */
      addChatMessage(message: ChatMessage) {
        patchState(store, {
          chatMessages: [...store.chatMessages(), message],
        });
      },

      /** Clear all chat messages */
      clearChat() {
        patchState(store, { chatMessages: [], chatIsLoading: false });
      },

      /** 📱 Open chat dialog */
      openChat() {
        patchState(store, { isChatOpen: true });
      },

      /** 📱 Close chat dialog */
      closeChat() {
        patchState(store, { isChatOpen: false });
      },

      /** 🍽️ Store AI-suggested meal (temporary, not applied) */
      setAISuggestedMeal(meal: SuggestedMeal | null) {
        patchState(store, {
          aiSuggestedMeal: meal,
          isAISuggestionApplied: false,
        });
      },

      /** ✅ Apply AI suggestion (user explicitly accepted) */
      applyAISuggestion() {
        if (store.aiSuggestedMeal()) {
          patchState(store, {
            isAISuggestionApplied: true,
          });
        }
      },

      /** ❌ Clear AI suggestion (user ignored or manually selected) */
      clearAISuggestion() {
        patchState(store, {
          aiSuggestedMeal: null,
          isAISuggestionApplied: false,
        });
      },

      /**
       * 🧠 MAIN ENTRY POINT: Send message with AI processing
       * 
       * Flow:
       * 1. Add user message to history
       * 2. Set loading state
       * 3. Use AI to interpret intent (or fallback to keywords)
       * 4. Filter foods by macro focus (if meal suggestion)
       * 5. Generate meal using existing algorithm
       * 6. Use AI to format response naturally
       * 7. Add assistant message to history
       * 8. Clear loading state
       */
      async sendChatMessage(text: string) {
        const trimmed = text.trim();
        if (!trimmed) return;

        // Step 1: Add user message
        const userMsg: ChatMessage = {
          role: 'user',
          content: trimmed,
          timestamp: Date.now(),
        };
        patchState(store, {
          chatMessages: [...store.chatMessages(), userMsg],
          chatIsLoading: true,
        });

        try {
          // Step 2: Use AI to interpret intent (or fall back to keywords)
          const aiIntent = await interpretWithAI(trimmed);

          // Step 3: Generate response based on AI intent
          const response = await this._generateResponse(aiIntent, trimmed);

          // Step 4: Add assistant response
          const assistantMsg: ChatMessage = {
            role: 'assistant',
            content: response,
            timestamp: Date.now(),
          };

          patchState(store, {
            chatMessages: [...store.chatMessages(), assistantMsg],
            chatIsLoading: false,
          });
        } catch (error) {
          // Fallback: Send error message
          console.error('Chat error:', error);
          const errorMsg: ChatMessage = {
            role: 'assistant',
            content: '⚠️ Ocurrió un error. Por favor, intenta de nuevo.',
            timestamp: Date.now(),
          };
          patchState(store, {
            chatMessages: [...store.chatMessages(), errorMsg],
            chatIsLoading: false,
          });
        }
      },

      /**
       * Generate response based on AI intent (helper)
       */
      async _generateResponse(aiIntent: AIIntent, userMessage: string): Promise<string> {
        if (aiIntent.intent === 'suggest_meal') {
          return this._generateMealResponse(aiIntent, userMessage);
        }

        if (aiIntent.intent === 'explain_macros') {
          return this._formatMacroExplanation();
        }

        if (aiIntent.intent === 'food_info') {
          return this._generateFoodInfoResponse(userMessage);
        }

        return 'Solo puedo ayudarte con temas de alimentación 🍽️\n\nPrueba preguntar:\n• "¿Qué puedo comer?"\n• "Sugiéreme algo proteico"\n• "¿Qué macros tiene el pollo?"';
      },

      /**
       * Generate meal suggestion response (helper)
       */
      async _generateMealResponse(aiIntent: AIIntent, userMessage: string): Promise<string> {
        const remaining = (store as any).remainingMacros?.();
        if (!remaining) {
          return '⚠️ No pude acceder a tus macros. Asegúrate de que tu plan de dieta esté configurado.';
        }

        const filteredFoods = filterByFocus(FOOD_BLOCKS, aiIntent.focus);
        const decision = mapDecision(aiIntent.style);
        const meal = generateSuggestedMeal(remaining, filteredFoods, 3, decision);

        // 🔥 Store meal as AI suggestion with meal context
        const mealId = store.activeMealId();
        if (mealId) {
          this.setAISuggestedMealForMeal(meal, mealId);
        } else {
          this.setAISuggestedMeal(meal);
        }

        if (OPENAI_API_KEY) {
          return await formatWithAI(meal, userMessage);
        }

        return formatMealSimple(meal);
      },

      /**
       * Generate food info response (helper)
       */
      _generateFoodInfoResponse(userMessage: string): string {
        const food = findFoodInMessage(userMessage);
        if (food) {
          return this._formatFoodInfo(food);
        }

        return '🔍 No encontré ese alimento en mi base de datos. Intenta con otro nombre.';
      },

      /** Format macro explanation (helper) */
      _formatMacroExplanation(): string {
        return [
          '📖 Los macronutrientes son los 3 grandes grupos de nutrientes:',
          '',
          '🥩 **Proteína** — Construye y repara músculo. Se encuentra en carnes, huevos, lácteos y legumbres. Aporta 4 kcal por gramo.',
          '',
          '🍚 **Carbohidratos** — Tu principal fuente de energía. Están en arroz, pan, pasta, frutas y tubérculos. Aportan 4 kcal por gramo.',
          '',
          '🥑 **Grasas** — Esenciales para hormonas y absorción de vitaminas. Están en aceites, frutos secos, aguacate y mantequilla. Aportan 9 kcal por gramo.',
          '',
          '💡 El balance correcto depende de tus objetivos (pérdida de grasa, ganancia muscular, mantenimiento).',
        ].join('\n');
      },

      /** Format food information (helper) */
      _formatFoodInfo(food: FoodBlock): string {
        const cals = Math.ceil(food.macros.protein * 4 + food.macros.carbs * 4 + food.macros.fats * 9);
        const categoryLabel = getCategoryLabel(food);

        return [
          `📋 **${food.name}**`,
          `Categoría: ${categoryLabel}`,
          '',
          '📊 Macros:',
          `  Proteína: ${food.macros.protein}g`,
          `  Carbohidratos: ${food.macros.carbs}g`,
          `  Grasas: ${food.macros.fats}g`,
          `  Calorías: ~${cals} kcal`,
        ].join('\n');
      },

      /** 🤖 Open chat for a specific meal */
      openChatForMeal(mealId: string) {
        patchState(store, {
          isChatOpen: true,
          activeMealId: mealId,
        });
      },

      /** 🎯 Store AI suggestion with meal context */
      setAISuggestedMealForMeal(meal: SuggestedMeal, mealId: string) {
        patchState(store, {
          pendingAISuggestion: { meal, mealId },
        });
      },

      /** ✅ Apply AI suggestion from chat (update meal selection) */
      applyAISuggestionFromChat() {
        const suggestion = store.pendingAISuggestion();
        
        if (!suggestion) return;

        const foodNames = suggestion.meal.items
          .map((item: FoodBlock) => item.name)
          .join(' + ');

        const mealOption: MealOption = {
          name: foodNames,
          macros: suggestion.meal.totals,
        };

        let decision: 'light' | 'balanced' | 'high-protein' = 'balanced';
        const totalCals = 
          suggestion.meal.totals.protein * 4 + 
          suggestion.meal.totals.carbs * 4 + 
          suggestion.meal.totals.fats * 9;
        
        if (totalCals < 300) {
          decision = 'light';
        } else if (suggestion.meal.totals.protein > 30) {
          decision = 'high-protein';
        }

        setTimeout(() => {
          patchState(store, {
            pendingAISuggestion: null,
            isChatOpen: false,
            activeMealId: null,
          });
        }, 100);
      },

      /** ❌ Reject AI suggestion from chat */
      rejectAISuggestionFromChat() {
        patchState(store, {
          pendingAISuggestion: null,
        });
      },
    })),
  );
}

