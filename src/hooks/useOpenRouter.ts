import { useState } from 'react';
import { chatCompletion, OpenRouterRequest, OpenRouterResponse } from '../services/openRouter';

interface UseOpenRouterOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export function useOpenRouter(options: UseOpenRouterOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [response, setResponse] = useState<OpenRouterResponse | null>(null);

  const sendMessage = async (message: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const request: OpenRouterRequest = {
        model: options.model || "anthropic/claude-3-opus-20240229",
        messages: [{ role: "user", content: message }],
        temperature: options.temperature,
        max_tokens: options.max_tokens,
      };

      const result = await chatCompletion(request);
      setResponse(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading,
    error,
    response,
  };
} 