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
   ├─ clearChat()
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

## Configuration

### Change API Model (Speed/Cost Trade-off)

In `interpretWithAI()` and `formatWithAI()`:
```typescript
body: JSON.stringify({
  model: 'gpt-4o-mini',  // or 'gpt-4' for higher quality
  temperature: 0.7,       // 0-1, higher = more creative
  max_tokens: 500,
});
```

---

**Status**: ✅ PRODUCTION READY
