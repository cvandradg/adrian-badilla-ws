# 📚 Documentation Index

Welcome to the **Adrian Badilla** application documentation! This folder contains all technical documentation organized by topic.

---

## 📂 Folder Structure

```
docs/
├── ai/              🤖 AI & Machine Learning
├── features/        ✨ Feature Implementation
├── architecture/    🏗️ System Architecture
├── guides/          📖 Quick Start & Integration
└── README.md        📋 This file
```

---

## 🤖 AI Integration

AI-powered nutrition chat, meal suggestions powered by OpenAI, and intelligent intent interpretation.

### Files
- **[NUTRITION_CHAT_SUMMARY.md](ai/NUTRITION_CHAT_SUMMARY.md)** - Overview of AI chat capabilities and quick reference
- **[NUTRITION_CHAT_AI_SETUP.md](ai/NUTRITION_CHAT_AI_SETUP.md)** - Complete setup guide for OpenAI API integration (3 methods)
- **[NUTRITION_CHAT_IMPLEMENTATION_DETAILS.md](ai/NUTRITION_CHAT_IMPLEMENTATION_DETAILS.md)** - Deep dive into AI architecture and request flow
- **[NUTRITION_CHAT_QUICK_REFERENCE.md](ai/NUTRITION_CHAT_QUICK_REFERENCE.md)** - API quick reference with examples
- **[AI_MEAL_CHAT_UX_INTEGRATION.md](ai/AI_MEAL_CHAT_UX_INTEGRATION.md)** - Hybrid chat + meal recommendation UX patterns
- **[AI_MEAL_CHAT_QUICK_START.md](ai/AI_MEAL_CHAT_QUICK_START.md)** - 3-step integration guide for chat + meals
- **[AI_CHAT_CONTEXTUAL_UX_REFINED.md](ai/AI_CHAT_CONTEXTUAL_UX_REFINED.md)** - Ultra-refined contextual chat design patterns

---

## ✨ Features

Core features implementation: Meal suggestions, macro tracking, and decision making.

### Files
- **[MEAL_SUGGESTION_GUIDE.md](features/MEAL_SUGGESTION_GUIDE.md)** - Complete meal suggestion feature guide with examples
- **[MEAL_SUGGESTION_QUICK_START.md](features/MEAL_SUGGESTION_QUICK_START.md)** - Implementation summary and 5-minute setup
- **[MEAL_SUGGESTION_DELIVERY.md](features/MEAL_SUGGESTION_DELIVERY.md)** - Delivery summary and what was implemented
- **[MACRO_TRACKER_GUIDE.md](features/MACRO_TRACKER_GUIDE.md)** - Comprehensive macro tracking implementation guide
- **[MACRO_TRACKER_QUICK_REFERENCE.md](features/MACRO_TRACKER_QUICK_REFERENCE.md)** - Quick reference for store signals and methods

---

## 🏗️ Architecture

System architecture, design patterns, and technical workflows.

### Files
- **[MEAL_SUGGESTION_ARCHITECTURE.md](architecture/MEAL_SUGGESTION_ARCHITECTURE.md)** - System diagrams, data flows, and quality scoring logic
- **[RECOMMENDATION_ENGINE.md](architecture/RECOMMENDATION_ENGINE.md)** - Meal recommendation engine deep dive

---

## 🚀 Quick Links

### Getting Started
1. **First time?** Start with [MEAL_SUGGESTION_QUICK_START.md](features/MEAL_SUGGESTION_QUICK_START.md)
2. **Setting up AI?** Follow [NUTRITION_CHAT_AI_SETUP.md](ai/NUTRITION_CHAT_AI_SETUP.md)
3. **Want UI patterns?** Check [AI_MEAL_CHAT_QUICK_START.md](ai/AI_MEAL_CHAT_QUICK_START.md)

### Understanding the System
- **Meal Algorithm**: [MEAL_SUGGESTION_ARCHITECTURE.md](architecture/MEAL_SUGGESTION_ARCHITECTURE.md)
- **Macro Tracking**: [MACRO_TRACKER_GUIDE.md](features/MACRO_TRACKER_GUIDE.md)
- **AI Integration**: [NUTRITION_CHAT_AI_SETUP.md](ai/NUTRITION_CHAT_AI_SETUP.md)

### API References
- **Meal Suggestion**: [MEAL_SUGGESTION_GUIDE.md](features/MEAL_SUGGESTION_GUIDE.md#🔌-store-integration)
- **Macro Tracker**: [MACRO_TRACKER_QUICK_REFERENCE.md](features/MACRO_TRACKER_QUICK_REFERENCE.md)
- **Chat**: [NUTRITION_CHAT_QUICK_REFERENCE.md](ai/NUTRITION_CHAT_QUICK_REFERENCE.md)

---

## 📊 Technology Stack

- **Framework**: Angular 20+ with `@ngrx/signals`
- **Package Manager**: Yarn
- **Build Tool**: Nx 21.2.1 Monorepo
- **AI**: OpenAI API (gpt-4o-mini)
- **Type Safety**: TypeScript (strict mode)
- **Linting**: SonarQube

---

## 🎯 Feature Overview

### Meal Suggestion Engine
- 47 realistic food blocks with verified macros
- Smart algorithm (soft constraints, priority-aware scoring)
- Category-specific suggestions (breakfast, lunch, dinner, snacks)
- Quality descriptors (Perfect match, Very close, Good approximation, etc.)
- **Status**: ✅ PRODUCTION READY

### Macro Tracker
- Real-time macro calculation and visualization
- Dynamic progress bars with color coding
- Personalized messages based on progress
- Calorie calculation (p×4 + c×4 + f×9)
- **Status**: ✅ PRODUCTION READY

### AI Nutrition Chat
- OpenAI-powered intent interpretation
- Keyword fallback (works without API key)
- Food information lookup
- Macro explanations
- Meal suggestions with AI formatting
- **Status**: ✅ PRODUCTION READY

### Hybrid Chat + Meal UX
- Non-intrusive AI button in meal cards
- Contextual chat with meal awareness
- In-chat suggestion actions (Apply/Reject)
- User-controlled, no auto-application
- **Status**: ✅ PRODUCTION READY

---

## 📝 Documentation Status

All documentation is **current as of April 16, 2026**.

| Component | Status | Last Updated |
|-----------|--------|--------------|
| Meal Suggestion | ✅ Complete | Apr 15, 2026 |
| Macro Tracker | ✅ Complete | Apr 15, 2026 |
| AI Chat | ✅ Complete | Apr 16, 2026 |
| Chat + Meal UX | ✅ Complete | Apr 16, 2026 |
| Contextual Chat | ✅ Complete | Apr 16, 2026 |

---

## 🤝 Contributing

When adding new features or updating documentation:
1. Create/update `.md` file
2. Place in appropriate folder (ai/, features/, architecture/)
3. Update this README.md with the new file link
4. Follow existing documentation format and emoji conventions

---

## 📞 Support

For issues or questions about:
- **Meal suggestions**: See [MEAL_SUGGESTION_GUIDE.md](features/MEAL_SUGGESTION_GUIDE.md#🧪-testing-the-feature)
- **Macro tracking**: See [MACRO_TRACKER_QUICK_REFERENCE.md](features/MACRO_TRACKER_QUICK_REFERENCE.md#debugging-tips-🔧)
- **AI chat**: See [NUTRITION_CHAT_AI_SETUP.md](ai/NUTRITION_CHAT_AI_SETUP.md#🛡️-error-handling)

---

**Generated**: April 21, 2026  
**Status**: ✅ All documentation organized and indexed
