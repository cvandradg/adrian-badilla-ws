// ─── OpenAI Client ────────────────────────────────────────────────────────────
// Thin wrapper around the OpenAI REST API.
// The API key MUST come from process.env.OPENAI_API_KEY (Secret Manager).
// Never hardcode or pass the key as a parameter.

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface OpenAiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAiChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AiChatRawResponse {
  content: string;
  mealSuggestion: {
    items: Array<{ name: string; protein: number; carbs: number; fats: number }>;
    totals: { protein: number; carbs: number; fats: number };
  } | null;
}

/**
 * Calls the OpenAI Chat Completions API.
 *
 * Security contract:
 *  - API key is read ONLY from process.env.OPENAI_API_KEY
 *  - The key is never logged, returned, or stored
 *  - Throws if the key is missing (prevents silent fallback calls)
 *
 * @param messages  Ordered list of messages (system + conversation history)
 * @param options   Optional overrides for model, temperature, maxTokens
 * @returns Parsed AiChatRawResponse
 */
export async function callOpenAiChat(
  messages: OpenAiMessage[],
  options: OpenAiChatOptions = {}
): Promise<AiChatRawResponse> {
  const apiKey = process.env['OPENAI_API_KEY'];
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set in Secret Manager.');
  }

  const model = options.model ?? 'gpt-4o-mini';
  const temperature = options.temperature ?? 0.5;
  const maxTokens = options.maxTokens ?? 400;

  const body = JSON.stringify({
    model,
    temperature,
    max_tokens: maxTokens,
    response_format: { type: 'json_object' },
    messages,
  });

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body,
  });

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    const errMsg = data?.error?.message ?? `OpenAI API error: ${response.status}`;
    throw new Error(errMsg);
  }

  const rawContent = data?.choices?.[0]?.message?.content ?? '';

  // Parse the JSON response from OpenAI
  let parsed: Partial<AiChatRawResponse> = {};
  try {
    parsed = JSON.parse(rawContent) as Partial<AiChatRawResponse>;
  } catch {
    // If JSON parsing fails, treat the content as plain text
    return { content: rawContent || '⚠️ No pude generar una respuesta.', mealSuggestion: null };
  }

  return {
    content: typeof parsed.content === 'string' && parsed.content.trim()
      ? parsed.content
      : '⚠️ No pude generar una respuesta.',
    mealSuggestion: parsed.mealSuggestion ?? null,
  };
}
