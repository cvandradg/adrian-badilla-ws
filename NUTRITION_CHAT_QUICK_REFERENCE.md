# 🚀 Quick Reference - AI Nutrition Chat

## What Changed?

### Before (Rule-Based)
```typescript
// Simple keyword matching
'proteica' → 'protein'
'ligero' → 'light'
// Limited understanding
```

### Now (AI-Powered)
```typescript
// AI understands intent
"Quiero ganar músculo, recomiéndame algo" 
→ { intent: 'suggest_meal', focus: 'protein', style: 'high_protein' }

// AI formats naturally
"Esta comida es perfecta porque el pollo tiene..."
```

---

## API Key Setup (3 Ways)

### Way 1: Window Global (Recommended)
```typescript
// main.ts or app initialization
(window as any).__NUTRITION_CHAT_API_KEY__ = 'sk-proj-...';
```

### Way 2: localStorage
```typescript
localStorage.setItem('openai_api_key', 'sk-proj-...');
```

### Way 3: No API Key (Fallback to keywords)
- ✅ Chat still works
- ❌ Less intelligent responses

---

## Feature Architecture

```typescript
withNutritionChat()
├─ State
│  ├─ chatMessages: ChatMessage[]
│  └─ chatIsLoading: boolean
│
├─ Computed
│  ├─ chatMessageCount
│  └─ lastChatMessage
│
└─ Methods
   ├─ sendChatMessage(text) ← Main entry point (now ASYNC + AI)
   ├─ addChatMessage(message)
   ├─ clearChat()
   ├─ _generateResponse(intent)
   ├─ _generateMealResponse(intent)
   ├─ _generateFoodInfoResponse(message)
   ├─ _formatMacroExplanation()
   └─ _formatFoodInfo(food)
```

---

## AI Integration Points

```typescript
// ↓ 1. User sends message
sendChatMessage(text)

// ↓ 2. AI interprets intent (with fallback to keywords)
interpretWithAI(text)
// → { intent, focus, style }

// ↓ 3. Route by intent
_generateResponse(aiIntent)

// ↓ 4. If meal suggestion:
_generateMealResponse(aiIntent)
├─ filterByFocus(foods, aiIntent.focus)  // Pre-filter foods
├─ mapDecision(aiIntent.style)            // Map style → decision
└─ generateSuggestedMeal(...)             // Your existing algorithm

// ↓ 5. Format with AI explanation (if API available)
formatWithAI(meal, userMessage)

// ↓ 6. Return to user
// User message + Response both in chatMessages[]
```

---

## Type System

```typescript
// Intent from AI
interface AIIntent {
  intent: 'suggest_meal' | 'food_info' | 'explain_macros' | 'invalid';
  focus: 'protein' | 'carbs' | 'fats' | 'none';
  style: 'light' | 'balanced' | 'high_protein' | 'low_carb';
}

// Chat history
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
```

---

## Key Functions

### `interpretWithAI(message: string): Promise<AIIntent>`
```typescript
// Uses OpenAI API to understand user intent
// System prompt: Detect intent + focus + style as JSON
// Fallback: Keyword detection if API fails
```

**System Prompt:**
```text
You are a nutrition assistant. Return ONLY JSON:
{
  "intent": "suggest_meal" | "food_info" | "explain_macros" | "invalid",
  "focus": "protein" | "carbs" | "fats" | "none",
  "style": "light" | "balanced" | "high_protein" | "low_carb"
}
```

### `formatWithAI(meal: object, userMessage: string): Promise<string>`
```typescript
// Uses OpenAI API to format meal suggestion naturally
// Explains why the meal helps in 2-3 sentences
// Includes macro details and confidence score
```

### `filterByFocus(foods: FoodBlock[], focus: MacroFocus): FoodBlock[]`
```typescript
// Pre-filter foods by macro focus
// protein: >= 10g, carbs: >= 15g, fats: >= 8g
// Used before generateSuggestedMeal() for better suggestions
```

### `mapDecision(style: MealStyle): DecisionType`
```typescript
// Maps AI style to meal generation decision
// 'high_protein' → 'protein'
// 'light' → 'light'
// 'low_carb' → 'protein'
// 'balanced' → 'balanced'
```

---

## Error Handling

All errors are handled gracefully:

```typescript
try {
  const aiIntent = await interpretWithAI(message);
  // ✅ AI successful
} catch {
  // ✅ Fallback to keyword detection automatically
}

try {
  await formatWithAI(meal, message);
  // ✅ AI formatting successful
} catch {
  // ✅ Use simple template formatting
}
```

---

## Usage in Component (Unchanged!)

```typescript
import { settingsStoreDev } from '../../store/settings.store';

export class NutritionChatComponent {
  private store = inject(settingsStoreDev);
  
  messages = this.store.chatMessages;
  isLoading = this.store.chatIsLoading;
  
  sendMessage(text?: string) {
    const content = text ?? this.inputText();
    // Now uses AI under the hood!
    this.store.sendChatMessage(content);
  }
}
```

---

## Example User Journeys

### Journey 1: Meal Suggestion
```
User: "Algo proteico para ganar músculo"
     ↓
AI Interprets:
  intent: 'suggest_meal'
  focus: 'protein'
  style: 'high_protein'
     ↓
System:
  Filters foods → protein >= 10g only
  Generates meal: [Pechuga, Papas, Aguacate]
  Asks AI to explain
     ↓
Response:
  🍽️ **Comida sugerida**:
  • Pechuga de pollo (100g)
  • Papas blancas (100g cocido)
  • Aguacate (50g)
  
  💭 Esta combinación es ideal para ganar músculo porque
  la pechuga es proteína pura y los carbos de papas...
  
  📊 Macros: 47g prot, 28g carbs, 9g fats (~405 kcal)
  
  🎯 Muy cercana a tus macros
```

### Journey 2: Food Info
```
User: "¿Qué macros tiene el atún?"
     ↓
AI Interprets:
  intent: 'food_info'
     ↓
System:
  Finds food in FOOD_BLOCKS
     ↓
Response:
  📋 **Atún en lata (100g)**
  Categoría: Proteína
  
  📊 Macros:
    Proteína: 29g
    Carbohidratos: 0g
    Grasas: 0.5g
    Calorías: ~116 kcal
```

### Journey 3: Macro Explanation
```
User: "¿Cómo funcionan los macronutrientes?"
     ↓
AI Interprets:
  intent: 'explain_macros'
     ↓
Response:
  📖 Los macronutrientes son los 3 grandes grupos...
  (Detailed explanation with emoji)
```

---

## Configuration

### Change API Model (Speed/Cost Trade-off)

In `interpretWithAI()` and `formatWithAI()`:
```typescript
body: JSON.stringify({
  model: 'gpt-3.5-turbo',  // Cheaper, less accurate
  // or
  model: 'gpt-4-turbo',    // Expensive, very accurate
  // or
  model: 'gpt-4o-mini',    // ✅ Default: best balance
})
```

### Adjust Filtering Thresholds
```typescript
function filterByFocus(foods, focus) {
  case 'protein':
    return foods.filter(f => f.macros.protein >= 15); // was 10
}
```

### Modify System Prompts
```typescript
// In interpretWithAI():
role: 'system',
content: `Your custom system prompt here...`

// In formatWithAI():
role: 'system',
content: `Your custom formatting prompt here...`
```

---

## Performance

| Operation | Time | Cost |
|-----------|------|------|
| Intent interpretation | ~1s | $0.0001 |
| Meal formatting | ~1s | $0.0003 |
| Keyword fallback | <100ms | $0 |
| **Total per turn** | ~1-2s | ~$0.0004 |

---

## Troubleshooting

**Problem**: Responses are template-based, not AI-generated  
**Solution**: Check if API key is set → `(window as any).__NUTRITION_CHAT_API_KEY__`

**Problem**: Chat is slow (> 2 seconds)  
**Solution**: It's the API latency. This is normal for OpenAI.

**Problem**: AI doesn't understand Spanish well  
**Solution**: Modify system prompts to be more specific about language

**Problem**: Meal suggestions are not protein-focused  
**Solution**: Adjust `filterByFocus()` thresholds or system prompt

---

## Files Reference

| File | Purpose |
|------|---------|
| `with-nutrition-chat.feature.ts` | ✅ Main implementation (all AI logic here) |
| `nutrition-chat.component.ts` | UI component (no changes!) |
| `meal-suggestion.utils.ts` | Meal algorithm (reused by AI) |
| `NUTRITION_CHAT_AI_SETUP.md` | Detailed setup guide |

---

## Next Steps

1. ✅ Get OpenAI API key
2. ✅ Set it at app initialization
3. ✅ Test chat in component
4. ✅ Tweak system prompts if needed
5. ✅ Toggle API key on/off to test fallback
6. ✅ Monitor API usage & costs
7. ✅ Deploy to production!

---

**Status**: 🚀 Ready to use!
