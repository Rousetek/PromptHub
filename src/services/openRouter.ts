const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';

if (!OPENROUTER_API_KEY) {
  console.error('OpenRouter API key is not set. Please check your .env file.');
}

export interface OpenRouterRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
}

export interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
}

// Default settings for social media content
const DEFAULT_SETTINGS = {
  max_tokens: 150,  // Much more reasonable for short-form content
  temperature: 0.7, // Balanced between creativity and coherence
  model: "anthropic/claude-3-haiku-20240307" // Faster and more efficient model
};

export async function chatCompletion(request: OpenRouterRequest): Promise<OpenRouterResponse> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key is not configured. Please check your environment variables.');
  }

  try {
    // Apply default settings and ensure reasonable limits
    const optimizedRequest = {
      ...DEFAULT_SETTINGS,
      ...request,
      max_tokens: Math.min(request.max_tokens || DEFAULT_SETTINGS.max_tokens, 500),
      messages: [
        {
          role: 'system',
          content: 'You are a social media content expert. Provide concise, engaging content optimized for short-form video platforms.'
        },
        ...request.messages
      ]
    };

    console.log('Sending request to OpenRouter:', {
      url: `${OPENROUTER_API_URL}/chat/completions`,
      model: optimizedRequest.model,
      messageCount: optimizedRequest.messages.length,
      maxTokens: optimizedRequest.max_tokens
    });

    const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Prompt Hub AI'
      },
      body: JSON.stringify(optimizedRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Received response from OpenRouter:', {
      id: data.id,
      choiceCount: data.choices?.length
    });
    return data;
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    if (error instanceof Error) {
      throw new Error(`OpenRouter API error: ${error.message}`);
    }
    throw error;
  }
}

// Example usage:
// const response = await chatCompletion({
//   model: "anthropic/claude-3-opus-20240229",
//   messages: [
//     { role: "user", content: "Hello, how are you?" }
//   ]
// }); 