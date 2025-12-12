/**
 * 🤖 OpenAI Integration (ChatGPT, GPT-4, GPT-4 Turbo)
 * Advanced AI generation for premium features
 */

import OpenAI from 'openai';
import { getConfig } from './config';

let openaiClient: OpenAI | null = null;

/**
 * Initialize OpenAI client
 */
export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const config = getConfig();
    if (!config.openai.apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    openaiClient = new OpenAI({
      apiKey: config.openai.apiKey,
      organization: config.openai.orgId,
    });
  }
  
  return openaiClient;
}

/**
 * Generate content using OpenAI (with fallback to Google AI)
 */
export async function generateWithOpenAI(
  prompt: string,
  options?: {
    model?: 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo';
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  }
): Promise<string> {
  try {
    const client = getOpenAIClient();
    
    const response = await client.chat.completions.create({
      model: options?.model || 'gpt-4',
      messages: [
        ...(options?.systemPrompt ? [{ role: 'system' as const, content: options.systemPrompt }] : []),
        { role: 'user' as const, content: prompt },
      ],
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 2000,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenAI generation failed:', error);
    throw error;
  }
}

/**
 * Generate content using OpenAI with structured output
 */
export async function generateWithOpenAIStructured(
  prompt: string,
  schema: Record<string, any>,
  options?: {
    model?: 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo';
    temperature?: number;
    systemPrompt?: string;
  }
): Promise<any> {
  try {
    const client = getOpenAIClient();
    
    const response = await client.chat.completions.create({
      model: options?.model || 'gpt-4-turbo',
      messages: [
        ...(options?.systemPrompt ? [{ role: 'system' as const, content: options.systemPrompt }] : []),
        { role: 'user' as const, content: prompt },
      ],
      temperature: options?.temperature || 0.7,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'response',
          schema: schema,
          strict: true,
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No content in response');
    
    return JSON.parse(content);
  } catch (error) {
    console.error('OpenAI structured generation failed:', error);
    throw error;
  }
}

/**
 * Generate content variations using OpenAI
 */
export async function generateVariationsWithOpenAI(
  content: string,
  count: number = 3,
  options?: {
    model?: 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo';
    temperature?: number;
    style?: string;
  }
): Promise<string[]> {
  try {
    const client = getOpenAIClient();
    
    const response = await client.chat.completions.create({
      model: options?.model || 'gpt-4-turbo',
      messages: [
        {
          role: 'system' as const,
          content: `You are an expert copywriter. Generate ${count} variations of the given content ${
            options?.style ? `in ${options.style} style` : ''
          }. Return ONLY the variations separated by "---", no explanations.`,
        },
        {
          role: 'user' as const,
          content: content,
        },
      ],
      temperature: options?.temperature || 0.8,
      max_tokens: 2000,
    });

    const text = response.choices[0]?.message?.content || '';
    return text.split('---').map(v => v.trim()).filter(v => v);
  } catch (error) {
    console.error('OpenAI variations generation failed:', error);
    throw error;
  }
}

/**
 * Analyze content with OpenAI
 */
export async function analyzeWithOpenAI(
  content: string,
  analysisType: 'sentiment' | 'engagement' | 'quality' | 'compliance',
  options?: {
    model?: 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo';
  }
): Promise<{
  score: number;
  analysis: string;
  suggestions: string[];
}> {
  try {
    const client = getOpenAIClient();
    
    const prompts: Record<string, string> = {
      sentiment: 'Analyze the sentiment of this content. Rate from 0-10 and provide analysis.',
      engagement: 'Analyze how engaging this content is. Rate from 0-10 and suggest improvements.',
      quality: 'Analyze the quality of this content. Rate from 0-10 and identify issues.',
      compliance: 'Check if this content complies with ethical guidelines. Rate from 0-10 and flag any issues.',
    };

    const response = await client.chat.completions.create({
      model: options?.model || 'gpt-4-turbo',
      messages: [
        {
          role: 'user' as const,
          content: `${prompts[analysisType]}\n\nContent:\n${content}\n\nRespond in JSON: {"score": 0-10, "analysis": "...", "suggestions": [...]}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 1000,
    });

    const text = response.choices[0]?.message?.content || '{}';
    const result = JSON.parse(text);
    
    return {
      score: result.score || 0,
      analysis: result.analysis || '',
      suggestions: result.suggestions || [],
    };
  } catch (error) {
    console.error('OpenAI analysis failed:', error);
    throw error;
  }
}

/**
 * Generate video script using OpenAI
 */
export async function generateVideoScriptWithOpenAI(
  topic: string,
  durationSeconds: number,
  options?: {
    platform?: 'tiktok' | 'instagram' | 'youtube' | 'youtube-shorts';
    style?: 'educational' | 'entertaining' | 'motivational' | 'sales';
    audienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  }
): Promise<{
  script: string;
  hooks: string[];
  callToActions: string[];
  estimatedDuration: number;
}> {
  try {
    const client = getOpenAIClient();
    
    const wordsPerMinute = durationSeconds / 60 * 120; // Approximate words for duration
    
    const response = await client.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system' as const,
          content: `You are an expert video scriptwriter for ${options?.platform || 'social media'}. 
          Create scripts that are ${options?.style || 'entertaining'} and optimized for engagement.
          Use hooks in the first 3 seconds. Include multiple CTAs.`,
        },
        {
          role: 'user' as const,
          content: `Create a ${durationSeconds}s video script for: ${topic}
          Target words: ~${Math.round(wordsPerMinute)}
          Audience: ${options?.audienceLevel || 'general'}
          
          Format response as JSON: {"script": "...", "hooks": [...], "callToActions": [...]}`,
        },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const text = response.choices[0]?.message?.content || '{}';
    const result = JSON.parse(text);
    
    return {
      script: result.script || '',
      hooks: result.hooks || [],
      callToActions: result.callToActions || [],
      estimatedDuration: durationSeconds,
    };
  } catch (error) {
    console.error('OpenAI video script generation failed:', error);
    throw error;
  }
}

/**
 * Generate image prompt using OpenAI (for use with DALL-E or other image generators)
 */
export async function generateImagePromptWithOpenAI(
  description: string,
  style?: string
): Promise<{
  prompt: string;
  variations: string[];
}> {
  try {
    const client = getOpenAIClient();
    
    const response = await client.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'user' as const,
          content: `Create 3 highly detailed DALL-E image generation prompts based on: "${description}"
          ${style ? `Style: ${style}` : ''}
          
          Format: Return ONLY 3 prompts, one per line, optimized for visual generation.`,
        },
      ],
      temperature: 0.9,
      max_tokens: 1000,
    });

    const text = response.choices[0]?.message?.content || '';
    const prompts = text.split('\n').filter(p => p.trim());
    
    return {
      prompt: prompts[0] || description,
      variations: prompts.slice(1, 3),
    };
  } catch (error) {
    console.error('OpenAI image prompt generation failed:', error);
    throw error;
  }
}

/**
 * Check if OpenAI is available
 */
export function isOpenAIAvailable(): boolean {
  try {
    const config = getConfig();
    return !!config.openai.apiKey;
  } catch {
    return false;
  }
}

export default {
  getClient: getOpenAIClient,
  generate: generateWithOpenAI,
  generateStructured: generateWithOpenAIStructured,
  generateVariations: generateVariationsWithOpenAI,
  analyze: analyzeWithOpenAI,
  generateVideoScript: generateVideoScriptWithOpenAI,
  generateImagePrompt: generateImagePromptWithOpenAI,
  isAvailable: isOpenAIAvailable,
};
