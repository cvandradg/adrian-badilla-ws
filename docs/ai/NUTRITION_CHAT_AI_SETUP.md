# 🤖 Hybrid AI-Powered Nutrition Chat

**Status**: ✅ COMPLETE & PRODUCTION-READY  
**Date**: April 16, 2026  
**Location**: `/libs/adrian-badilla/frontend/settings/src/lib/store/with-nutrition-chat.feature.ts`

---

## 🎯 What's New

Your nutrition chat is now a **real AI assistant**, not a rule-based chatbot:

```
User: "Sugiéreme algo proteico"
  ↓
🧠 AI interprets intent, focus (protein), style (high_protein)
  ↓
🔍 Filters FOOD_BLOCKS → protein-rich options only
  ↓
🍽️ Generates meal: [Pechuga, Arroz, Aguacate]
  ↓
🤖 AI formats response naturally in Spanish
  ↓
User sees: Natural explanation + macro details + confidence score
```

---

## ⚙️ HOW TO SET UP

### Step 1: Add OpenAI API Key

The feature automatically detects your API key from ONE of these sources (in order):

**Option A: Window global variable (Recommended for production)**
```typescript
// In your main.ts or app initialization:
(window as any).__NUTRITION_CHAT_API_KEY__ = 'sk-proj-...your-key...';
```

**Option B: localStorage (For development)**
```typescript
// In browser console or your app:
localStorage.setItem('openai_api_key', 'sk-proj-...your-key...');
```

**Option C: No API key set**
- ✅ Chat still works!
- ✅ Falls back to smart keyword detection
- ❌ Responses are simpler (text templates instead of AI-generated)

### Step 2: Get Your OpenAI API Key

1. Go to: https://platform.openai.com/api/keys
2. Create new API key
3. Set up billing (costs are minimal: ~$0.01 per 1000 requests with gpt-4o-mini)
4. Copy and store securely (never commit to git!)

### Step 3: Inject Key in Your App

**For Firebase Cloud Functions (backend):**
```typescript
// Set as environment variable
process.env.OPENAI_API_KEY = 'sk-proj-...';
```

**For Web App (frontend with environment):**
```typescript
// Create environment.ts:
export const environment = {
  openaiApiKey: import.meta.env['VITE_OPENAI_API_KEY'] || '',
};

// In main.ts:
import { environment } from './environments/environment';
(window as any).__NUTRITION_CHAT_API_KEY__ = environment.openaiApiKey;
```

**For local development (.env file):**
```bash
# .env
VITE_OPENAI_API_KEY=sk-proj-...your-key...
```

---

## 🧠 How AI Powers Your Chat

### 1️⃣ Intent Interpretation

**AI-powered version:**
```typescript
// Sends to OpenAI with system prompt
async function interpretWithAI(message: string): Promise<AIIntent>

// Returns: { intent, focus, style } with high accuracy
```

**Example intents detected:**
- `"Sugiéreme algo proteico"` → `{ intent: 'suggest_meal', focus: 'protein', style: 'high_protein' }`
- `"¿Qué macros tiene el pollo?"` → `{ intent: 'food_info', focus: 'none', style: 'balanced' }`
- `"¿Cómo funcionan los macros?"` → `{ intent: 'explain_macros', focus: 'none', style: 'balanced' }`

### 2️⃣ Smart Food Filtering

After AI detects intent + focus, foods are pre-filtered:

```typescript
// If user wants "proteico" meals
filterByFocus(FOOD_BLOCKS, 'protein')
// ↓ Returns only foods with protein >= 10g
// [Pollo, Pechuga, Atún, Huevo, Claras, ...]
```

### 3️⃣ Meal Generation (Your Existing Algorithm)

Uses your proven `generateSuggestedMeal()` with:
- Filtered food list (macro-focused)
- Decision type mapped from AI style
- Smart macro matching algorithm

### 4️⃣ Natural Response Formatting

**AI-powered version:**
```typescript
async function formatWithAI(meal: any, userMessage: string): Promise<string>
```

Sends meal + user message to OpenAI → Gets natural explanation → Returns formatted response

**Example response:**
```
🍽️ **Comida sugerida**:
• Pechuga de pollo (100g)
• Arroz integral (100g cocido)
• Aguacate (50g)

💭 Esta combinación es perfecta para ti ya que prioriza la proteína
para construir músculo. El arroz te da energía de carbos complejos,
y el aguacate añade grasas saludables para absorber vitaminas.

📊 Macros de esta comida:
  🥩 Proteína: 47g
  🌾 Carbohidratos: 51g
  🥑 Grasas: 19.5g
  🔥 Calorías: ~405 kcal

🎯 Muy cercana a tus macros restantes
```

---

## 🔄 Request Flow (Complete)

```typescript
user.sendMessage("algo proteico")
  ↓
[Store] sendChatMessage(text)
  ├─ Add user message to chatMessages[]
  └─ Set chatIsLoading = true
  ↓
[AI] interpretWithAI(text)
  ├─ Send to OpenAI API with system prompt
  └─ Get { intent, focus, style }
  ↓
[Helper] _generateResponse(aiIntent)
  ├─ Route by intent type
  └─ Call appropriate handler
  ↓
[AI] formatWithAI(meal, message) [ONLY if API key set]
  ├─ Send meal + user context to OpenAI
  └─ Get natural explanation
  ↓
[Store] Add assistant message to chatMessages[]
  ├─ Set chatIsLoading = false
  ↓
[UI] Updates automatically (signals!)
```

---

## 🛡️ Error Handling

### If API fails:
```typescript
try {
  const aiIntent = await interpretWithAI(message);
} catch (error) {
  // Automatically falls back to keyword detection
  return interpretWithKeywords(message);
}
```

### Graceful degradation:
- ✅ No API key? Uses keyword detection
- ✅ API down? Falls back to simple formatting
