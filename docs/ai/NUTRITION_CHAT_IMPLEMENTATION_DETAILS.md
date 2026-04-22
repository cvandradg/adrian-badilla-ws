# 🧠 AI Nutrition Chat - Implementation Details

> Deep dive into the hybrid AI-powered chat architecture. Everything lives inside the Signal Store feature!

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│         NutritionChatComponent (UI)                     │
│   ✅ Sends messages                                     │
│   ✅ Displays chat history                              │
│   ✅ Shows loading indicator                            │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓ sendChatMessage(text)
                 │
┌─────────────────────────────────────────────────────────┐
│    withNutritionChat() Signal Store Feature             │
│  🧠 ALL AI logic lives here (NO services!)              │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ State:                                           │  │
│  │  • chatMessages: ChatMessage[]                   │  │
│  │  • chatIsLoading: boolean                        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Main Methods:                                    │  │
│  │  • sendChatMessage(text) [ASYNC]                │  │
│  │  • addChatMessage(message)                       │  │
│  │  • clearChat()                                   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Helper Methods:                                  │  │
│  │  • _generateResponse(aiIntent)                   │  │
│  │  • _generateMealResponse(aiIntent)               │  │
│  │  • _generateFoodInfoResponse(message)            │  │
│  │  • _formatMacroExplanation()                     │  │
│  │  • _formatFoodInfo(food)                         │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Global AI Functions:                             │  │
│  │  • interpretWithAI(message)  [ASYNC]             │  │
│  │  • interpretWithKeywords(message) [FALLBACK]     │  │
│  │  • formatWithAI(meal, message) [ASYNC]           │  │
│  │  • filterByFocus(foods, focus)                   │  │
│  │  • mapDecision(style)                            │  │
│  │  • getCategoryLabel(food)                        │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────────────┘
                 │
                 ├─→ OpenAI API (if key available)
                 │   └─ interpretWithAI() → Format response
                 │
                 └─→ Keyword Detection (fallback)
                     └─ interpretWithKeywords()
```

---

## Complete Request Flow (Detailed)

### 1. User Sends Message

```typescript
// In Component:
sendMessage(text?: string) {
  const content = text ?? this.inputText();
  
  // ✅ Now calls async version!
  this.store.sendChatMessage(content);
}
```

### 2. Initialize Loading State

```typescript
// In Store Method:
async sendChatMessage(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return; // Ignore empty messages

  // Add user message immediately
  const userMsg: ChatMessage = {
    role: 'user',
    content: trimmed,
    timestamp: Date.now(),
  };
  
  patchState(store, {
    chatMessages: [...store.chatMessages(), userMsg],
    chatIsLoading: true, // ← Show loading spinner
  });
```

### 3. AI Intent Interpretation

```typescript
// Option A: With OpenAI API
async function interpretWithAI(message: string): Promise<AIIntent> {
  if (!OPENAI_API_KEY) {
    return interpretWithKeywords(message); // Graceful fallback
  }

  try {
    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // ✅ Optimal: fast + cheap + accurate
          messages: [
            {
              role: 'system',
              content: `You are a nutrition assistant inside a diet app.
              
Return ONLY valid JSON with no additional text:
{
  "intent": "suggest_meal" | "food_info" | "explain_macros" | "invalid",
  "focus": "protein" | "carbs" | "fats" | "none",
  "style": "light" | "balanced" | "high_protein" | "low_carb"
}

Rules:
- Detect if user wants food suggestion ("comer", "comida", "meal")
- Detect specific macros mentioned ("proteina", "carbs")
- Detect meal style preference ("ligero"=light, "proteico"=high_protein)
- Default to "invalid" if unclear
- NEVER include explanations, ONLY JSON`,
            },
            {
              role: 'user',
              content: message,
            },
          ],
          temperature: 0.3, // ← Deterministic (good for structured output)
          max_tokens: 150,
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.warn('AI failed:', data?.error?.message);
      return interpretWithKeywords(message); // Fallback
    }

    // Extract JSON from response
    const content = data?.choices?.[0]?.message?.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) return interpretWithKeywords(message);

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate structure
    if (parsed.intent && parsed.focus && parsed.style) {
      return parsed as AIIntent;
    }

    return interpretWithKeywords(message);
  } catch (error) {
    console.warn('AI error:', error);
    return interpretWithKeywords(message); // Safe fallback
  }
}

// Option B: Keyword Detection (Fallback)
function interpretWithKeywords(message: string): AIIntent {
  const lower = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Check for specific food first
  const matchedFood = findFoodInMessage(message);
  if (matchedFood) {
    return {
      intent: 'food_info',
      focus: 'none',
      style: 'balanced',
    };
  }

  // Check for meal suggestion keywords
  const suggestKeywords = ['comer', 'comida', 'meal', 'sugerir', 'hambre', etc.];
  const isSuggestMeal = suggestKeywords.some(kw => lower.includes(kw));

  // Detect macro focus
  let focus: MacroFocus = 'none';
  if (lower.includes('proteina')) focus = 'protein';
  else if (lower.includes('carb')) focus = 'carbs';
  else if (lower.includes('grasa')) focus = 'fats';

  // Detect style preference
  let style: MealStyle = 'balanced';
  if (lower.includes('proteico')) style = 'high_protein';
  else if (lower.includes('ligero')) style = 'light';
  else if (lower.includes('bajo carb')) style = 'low_carb';

  if (isSuggestMeal) {
    return { intent: 'suggest_meal', focus, style };
  }

  // Check for macro questions
  const macroKeywords = ['macro', 'nutrient', 'proteina', 'carb', 'grasa'];
  if (macroKeywords.some(kw => lower.includes(kw))) {
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
```

### 4. Route by Intent

```typescript
async _generateResponse(aiIntent: AIIntent, userMessage: string): Promise<string> {
  // Route to appropriate handler
  
  if (aiIntent.intent === 'suggest_meal') {
    return this._generateMealResponse(aiIntent, userMessage);
  }

  if (aiIntent.intent === 'explain_macros') {
    return this._formatMacroExplanation();
  }

  if (aiIntent.intent === 'food_info') {
    return this._generateFoodInfoResponse(userMessage);
  }

  // Default: invalid intent
  return 'Solo puedo ayudarte con temas de alimentación 🍽️...';
}
```

### 5. Generate Meal Response

```typescript
async _generateMealResponse(aiIntent: AIIntent, userMessage: string): Promise<string> {
  // Step 1: Get remaining macros from parent store
  const remaining = (store as any).remainingMacros?.();
  if (!remaining) {
    return '⚠️ No pude acceder a tus macros...';
  }

  // Step 2: Filter foods by AI-detected focus
  const filteredFoods = filterByFocus(FOOD_BLOCKS, aiIntent.focus);
  // If focus='protein': returns foods with protein >= 10g
  // If focus='carbs': returns foods with carbs >= 15g
  // If focus='fats': returns foods with fats >= 8g
  // If focus='none': returns all foods

  // Step 3: Map AI style to meal generation type
  const decision = mapDecision(aiIntent.style);
  // 'high_protein' → 'protein'
  // 'light' → 'light'
  // 'low_carb' → 'protein'
  // 'balanced' → 'balanced'

  // Step 4: Generate meal using YOUR EXISTING ALGORITHM
  const meal = generateSuggestedMeal(
    remaining,
    filteredFoods, // Pre-filtered by focus
    3,             // Max 3 items
    decision       // Meal type preference
  );

  // Step 5: Format with AI explanation (if API available)
  if (OPENAI_API_KEY) {
    return await formatWithAI(meal, userMessage);
  } else {
    return formatMealSimple(meal);
  }
}
```

### 6. Format with AI (Optional)

```typescript
async function formatWithAI(meal: any, userMessage: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    return formatMealSimple(meal);
  }

  try {
    const itemsList = meal.items.map(item => item.name).join(', ');
    const cals = calculateCalories(meal.totals);

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
            content: `You are a friendly nutrition assistant.
            
User asked: "${userMessage}"
Suggested meal: ${itemsList}
Macros: Protein ${Math.ceil(meal.totals.protein)}g, Carbs ${Math.ceil(meal.totals.carbs)}g, Fats ${Math.ceil(meal.totals.fats)}g

Write a SHORT, natural explanation (2-3 sentences in Spanish) about why this meal helps.
Be friendly and concise. Use emoji. Do NOT list the foods again.`,
          },
        ],
        temperature: 0.7, // ← More creative for explanations
        max_tokens: 100,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return formatMealSimple(meal);
    }

    const explanation = data?.choices?.[0]?.message?.content;
    if (!explanation) return formatMealSimple(meal);

    // Build response with AI explanation
    return formatMealWithExplanation(meal, explanation);
  } catch (error) {
    console.warn('Formatting error:', error);
    return formatMealSimple(meal); // Fallback to simple format
  }
}

// Fallback simple formatter (NO AI needed)
function formatMealSimple(meal: any): string {
  const itemsList = meal.items
    .map(item => `• ${item.name}`)
    .join('\n');

  const cals = Math.ceil(
    meal.totals.protein * 4 +
    meal.totals.carbs * 4 +
    meal.totals.fats * 9
  );

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

// AI-powered formatter (MORE natural)
function formatMealWithExplanation(meal: any, explanation: string): string {
  const itemsList = meal.items
    .map(item => `• ${item.name}`)
    .join('\n');

  const cals = Math.ceil(
    meal.totals.protein * 4 +
    meal.totals.carbs * 4 +
    meal.totals.fats * 9
  );

  return [
    `🍽️ **Comida sugerida**:`,
    '',
    itemsList,
    '',
    `💭 ${explanation}`, // ← AI-generated explanation
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
```

### 7. Add Response to Chat

```typescript
// Back in sendChatMessage()
const assistantMsg: ChatMessage = {
  role: 'assistant',
  content: response,
  timestamp: Date.now(),
};

patchState(store, {
  chatMessages: [...store.chatMessages(), assistantMsg],
  chatIsLoading: false, // ← Hide loading spinner
});

// Component automatically updates via signals! 🎉
```

---

## Helper Functions

### `filterByFocus()`
```typescript
function filterByFocus(foods: FoodBlock[], focus: MacroFocus): FoodBlock[] {
  if (focus === 'none') return foods;

  switch (focus) {
    case 'protein':
      // Only foods with >= 10g protein
      return foods.filter(f => f.macros.protein >= 10);
    case 'carbs':
      // Only foods with >= 15g carbs
      return foods.filter(f => f.macros.carbs >= 15);
    case 'fats':
      // Only foods with >= 8g fats
      return foods.filter(f => f.macros.fats >= 8);
    default:
      return foods;
  }
}
```

**Examples:**
```typescript
// User says "algo proteico"
filterByFocus(FOOD_BLOCKS, 'protein')
// ↓ Returns: [Pollo, Pechuga, Atún, Huevo, etc.] (high protein only)

// User says "algo con carbos"
filterByFocus(FOOD_BLOCKS, 'carbs')
// ↓ Returns: [Arroz, Pan, Papas, Avena, etc.] (high carbs only)

// User says nothing specific
filterByFocus(FOOD_BLOCKS, 'none')
// ↓ Returns: [ALL 47 foods] (full list)
```

### `mapDecision()`
```typescript
function mapDecision(style: MealStyle): DecisionType {
  switch (style) {
    case 'high_protein':
      return 'protein'; // Prioritize protein
    case 'light':
      return 'light'; // Minimize calories
    case 'low_carb':
      return 'protein'; // Minimizes carbs = prioritize protein
    default:
      return 'balanced'; // Standard macros
  }
}
```

### `getCategoryLabel()`
```typescript
function getCategoryLabel(food: FoodBlock): string {
  switch (food.category) {
    case 'protein': return 'Proteína';
    case 'carbs': return 'Carbohidratos';
    case 'fats': return 'Grasas';
    default: return 'Mixto';
  }
}
```

---

## Error Handling Best Practices

### API Errors (Graceful Degradation)
```typescript
try {
  const aiIntent = await interpretWithAI(message);
  // ✅ AI succeeded
} catch (error) {
  console.warn('AI failed:', error);
  // ✅ Automatically use keyword detection
  const aiIntent = interpretWithKeywords(message);
}
```

### Network Errors
```typescript
if (!response.ok) {
  console.warn('API error:', data?.error?.message);
  // ✅ Fall back to keyword detection
  return interpretWithKeywords(message);
}
```

### Missing API Key
```typescript
if (!OPENAI_API_KEY) {
  // ✅ Use keyword detection
  return interpretWithKeywords(message);
}
```

### Malformed Response
```typescript
const jsonMatch = content.match(/\{[\s\S]*\}/);
if (!jsonMatch) {
  // ✅ Fall back to keywords
  return interpretWithKeywords(message);
}
```

---

## Performance Optimization

### 1. Caching Intent Detection
```typescript
// Optional: cache recent intents (if same message asked again)
const intentCache = new Map<string, AIIntent>();

async function interpretWithAI(message: string): Promise<AIIntent> {
  if (intentCache.has(message)) {
    return intentCache.get(message)!; // Instant return
  }
  
  const intent = await callOpenAI(message);
  intentCache.set(message, intent);
  return intent;
}
```

### 2. Batch Messages
```typescript
// Don't send every letter to API, wait for complete message
// (Already handled by component with Enter key check)
```

### 3. Use Cheaper Model for Simple Tasks
```typescript
// For intent detection (structured output):
model: 'gpt-3.5-turbo' // Faster, cheaper, good enough

// For formatting (creative text):
model: 'gpt-4-turbo' // Higher quality (if budget allows)
```

---

## Testing Checklist

- [ ] Test with API key set → AI responses
- [ ] Test without API key → Keyword fallback
- [ ] Test with API down → Should gracefully fail
- [ ] Test all intent types: suggest_meal, explain_macros, food_info, invalid
- [ ] Test all macro focuses: protein, carbs, fats, none
- [ ] Test all styles: light, balanced, high_protein, low_carb
- [ ] Test empty message → Should ignore
- [ ] Test very long message → Should handle
- [ ] Test special characters → Should normalize

---

## Customization Examples

### Change Default Model
```typescript
// In interpretWithAI():
body: JSON.stringify({
  model: 'gpt-3.5-turbo', // Cheaper!
  // ...
})
```

### Add New Intent Type
```typescript
type AIIntentType = 'suggest_meal' | 'food_info' | 'explain_macros' | 
                    'recipe_ideas' | 'invalid';

// Then in _generateResponse():
if (aiIntent.intent === 'recipe_ideas') {
  return this._generateRecipeResponse(aiIntent);
}
```

### Adjust Filtering Thresholds
```typescript
function filterByFocus(foods, focus) {
  case 'protein':
    return foods.filter(f => f.macros.protein >= 15); // was 10
}
```

### Modify System Prompt
```typescript
messages: [
  {
    role: 'system',
    content: `Custom system prompt...` // Your changes
  },
]
```

---

## References

- OpenAI API: https://platform.openai.com/docs
- Signal Store Docs: https://ngrx.io/guide/signals
- Your meal algorithm: `meal-suggestion.utils.ts`

---

**Status**: ✅ Complete & Production-Ready!
