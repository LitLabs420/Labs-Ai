interface AIResponse {
  text: string;
  tokenUsage: {
    input: number;
    output: number;
  };
}

interface AIGenerationOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stopSequences?: string[];
}

interface AIModel {
  generate(
    prompt: string,
    options: AIGenerationOptions,
    model: string
  ): Promise<AIResponse>;
  
  parseJSON(text: string): unknown;
  
  extractParameters(text: string): Record<string, unknown>;
}

class GoogleAIModel implements AIModel {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate(
    prompt: string,
    options: AIGenerationOptions,
    _model: string
  ): Promise<AIResponse> {
    try {
      // TODO: Call Google Generative AI API
      // For now, return mock response
      return {
        text: "Generated response",
        tokenUsage: {
          input: prompt.split(" ").length,
          output: 10,
        },
      };
    } catch (error) {
      console.error("Google AI generation error:", error);
      throw error;
    }
  }

  parseJSON(text: string): unknown {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return null;
    } catch {
      return null;
    }
  }

  extractParameters(text: string): Record<string, unknown> {
    const params: Record<string, unknown> = {};
    const lines = text.split("\n");

    for (const line of lines) {
      const match = line.match(/(\w+):\s*(.+)/);
      if (match) {
        params[match[1]] = match[2].trim();
      }
    }

    return params;
  }
}

class OpenAIModel implements AIModel {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate(
    prompt: string,
    options: AIGenerationOptions,
    _model: string
  ): Promise<AIResponse> {
    try {
      // TODO: Call OpenAI API
      // For now, return mock response
      return {
        text: "Generated response",
        tokenUsage: {
          input: prompt.split(" ").length,
          output: 10,
        },
      };
    } catch (error) {
      console.error("OpenAI generation error:", error);
      throw error;
    }
  }

  parseJSON(text: string): unknown {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return null;
    } catch {
      return null;
    }
  }

  extractParameters(text: string): Record<string, unknown> {
    const params: Record<string, unknown> = {};
    const lines = text.split("\n");

    for (const line of lines) {
      const match = line.match(/(\w+):\s*(.+)/);
      if (match) {
        params[match[1]] = match[2].trim();
      }
    }

    return params;
  }
}

const modelInstances: { [key: string]: AIModel } = {};

export function initializeAIModels(): void {
  const googleKey = process.env.GOOGLE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (googleKey) {
    modelInstances["gemini-2.0-flash"] = new GoogleAIModel(googleKey);
    modelInstances["gemini-pro"] = new GoogleAIModel(googleKey);
    console.log("[AIIntegration] Google AI models initialized");
  }

  if (openaiKey) {
    modelInstances["gpt-4"] = new OpenAIModel(openaiKey);
    modelInstances["gpt-3.5-turbo"] = new OpenAIModel(openaiKey);
    console.log("[AIIntegration] OpenAI models initialized");
  }

  if (!googleKey && !openaiKey) {
    console.warn(
      "[AIIntegration] No AI model keys configured. Set GOOGLE_API_KEY or OPENAI_API_KEY"
    );
  }
}

export function getAIModel(modelName: string): AIModel {
  const model = modelInstances[modelName];
  if (!model) {
    // Fallback to first available model
    const fallback = Object.values(modelInstances)[0];
    if (!fallback) {
      throw new Error(
        `AI model '${modelName}' not available and no fallback configured`
      );
    }
    console.warn(
      `[AIIntegration] Model '${modelName}' not found, using fallback`
    );
    return fallback;
  }
  return model;
}

export function listAvailableModels(): string[] {
  return Object.keys(modelInstances);
}
