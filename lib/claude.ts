import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ClaudeGenerationOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  system?: string;
}

/**
 * Generate text using Claude 3.5 Sonnet (Best for content generation)
 * Superior to GPT for creative writing, scripts, and captions
 */
export async function generateWithClaude(
  options: ClaudeGenerationOptions
): Promise<string> {
  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: options.maxTokens || 2048,
      temperature: options.temperature || 0.7,
      system: options.system || "You are a helpful AI assistant.",
      messages: [
        {
          role: "user",
          content: options.prompt,
        },
      ],
    });

    const textContent = response.content[0];
    if (textContent.type === "text") {
      return textContent.text;
    }
    throw new Error("Unexpected response type from Claude");
  } catch (error) {
    console.error("Claude generation error:", error);
    throw error;
  }
}

/**
 * Generate captions for social media (TikTok, Instagram, etc.)
 */
export async function generateCaption(
  topic: string,
  platform: "tiktok" | "instagram" | "youtube" | "twitter"
): Promise<string> {
  const platformGuidelines = {
    tiktok: "TikTok captions should be 15-50 characters, catchy, trendy, with relevant hashtags",
    instagram:
      "Instagram captions should be 50-150 characters, engaging, with 10-20 hashtags",
    youtube:
      "YouTube descriptions should be 200-500 characters, detailed, with timestamps and links",
    twitter: "Twitter posts should be under 280 characters, witty, with relevant hashtags",
  };

  return generateWithClaude({
    prompt: `Create a ${platform} caption for: ${topic}`,
    system: `You are a social media expert. ${platformGuidelines[platform]}. Return ONLY the caption text, nothing else.`,
    maxTokens: 200,
  });
}

/**
 * Generate video scripts (30-60 second videos)
 */
export async function generateVideoScript(
  topic: string,
  duration: "30s" | "60s"
): Promise<string> {
  const wordCount = duration === "30s" ? 75 : 150;

  return generateWithClaude({
    prompt: `Write a compelling ${duration} video script about: ${topic}. Must be exactly ${wordCount} words.`,
    system:
      "Write engaging, conversational scripts for short-form videos. Include [ACTION] tags for scene changes.",
    maxTokens: 500,
  });
}

/**
 * Generate DM/message content (WhatsApp, SMS, etc.)
 */
export async function generateDMContent(
  purpose: string,
  audience: string
): Promise<string> {
  return generateWithClaude({
    prompt: `Generate a professional yet friendly message for ${audience} about: ${purpose}. Keep it under 160 characters.`,
    system:
      "Write concise, persuasive messages that convert. No emojis unless requested.",
    maxTokens: 200,
  });
}

/**
 * Analyze content quality and provide feedback
 */
export async function analyzeContent(content: string): Promise<{
  score: number;
  feedback: string;
  improvements: string[];
}> {
  const response = await generateWithClaude({
    prompt: `Analyze this content and provide a quality score (1-10) and improvement suggestions:\n\n${content}`,
    system:
      "Provide constructive feedback on content quality, engagement potential, and SEO. Return JSON format: {score: number, feedback: string, improvements: string[]}",
    maxTokens: 500,
  });

  try {
    return JSON.parse(response);
  } catch {
    return {
      score: 5,
      feedback: response,
      improvements: ["Review the generated feedback"],
    };
  }
}

export default client;
