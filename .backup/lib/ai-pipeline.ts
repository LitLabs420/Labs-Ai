// Complete AI Pipeline - All AI models integrated
import { generateWithClaude } from "./claude";
import { generateImage } from "./replicate";
import { generateSpeech, PREMIUM_VOICES } from "./elevenlabs";

export interface ContentGenerationRequest {
  type: "caption" | "script" | "image" | "voice" | "video" | "full";
  topic: string;
  platform?: string;
  style?: string;
  tone?: string;
}

export interface GeneratedContent {
  caption?: string;
  script?: string;
  images?: string[];
  voiceUrl?: string;
  videoUrl?: string;
  quality?: number;
}

// Generate complete content kit (caption + image + voice)
export async function generateCompleteContentKit(
  topic: string,
  platform: "tiktok" | "instagram" | "youtube" = "tiktok"
): Promise<GeneratedContent> {
  try {
    console.log(`🎬 Generating complete content kit for: ${topic}`);

    // 1. Generate caption (Claude)
    const caption = await generateWithClaude({
      prompt: `Create a viral ${platform} caption for: ${topic}`,
      system: `You are a social media expert. Create compelling, trendy captions with relevant hashtags.`,
      maxTokens: 200,
    });

    // 2. Generate image (Replicate/FLUX)
    const images = await generateImage({
      prompt: `Professional ${platform} post about ${topic}, trending, high quality, vibrant colors`,
      width: platform === "tiktok" ? 1080 : 1024,
      height: platform === "tiktok" ? 1920 : 1080,
      numOutputs: 1,
    });

    // 3. Generate voice-over (ElevenLabs)
    const voiceBuffer = await generateSpeech({
      text: caption,
      voiceId: PREMIUM_VOICES.FEMALE_PROFESSIONAL,
      stability: 0.7,
      similarityBoost: 0.8,
    });

    // Convert buffer to base64 for storage
    const voiceBase64 = voiceBuffer.toString("base64");

    return {
      caption,
      images,
      voiceUrl: `data:audio/mp3;base64,${voiceBase64}`,
      quality: 9, // 9/10 quality
    };
  } catch (error) {
    console.error("Content kit generation error:", error);
    throw error;
  }
}

// Generate script + voice (for YouTube, podcasts)
export async function generateVideoPackage(
  topic: string,
  duration: "30s" | "60s" | "120s" = "60s"
): Promise<{
  script: string;
  voiceOver: string;
  images: string[];
  quality: number;
}> {
  try {
    console.log(`📹 Generating video package: ${duration}`);

    // Generate script
    const script = await generateWithClaude({
      prompt: `Write a compelling ${duration} video script about: ${topic}`,
      system:
        "Write engaging, conversational scripts. Include [ACTION] tags. Keep it concise.",
      maxTokens: 500,
    });

    // Generate voice over
    const voiceBuffer = await generateSpeech({
      text: script,
      voiceId: PREMIUM_VOICES.MALE_PROFESSIONAL,
      stability: 0.75,
      similarityBoost: 0.85,
      style: 0.5,
      speakerBoost: true,
    });

    // Generate multiple images for video
    const images = await generateImage({
      prompt: `Professional video thumbnail about ${topic}, cinematic, high quality, 8k`,
      numOutputs: 3,
      width: 1920,
      height: 1080,
    });

    return {
      script,
      voiceOver: voiceBuffer.toString("base64"),
      images,
      quality: 10,
    };
  } catch (error) {
    console.error("Video package generation error:", error);
    throw error;
  }
}

// Generate DM/SMS content with follow-up sequences
export async function generateDMSequence(
  purpose: string,
  followUpCount: number = 3
): Promise<string[]> {
  const messages: string[] = [];

  for (let i = 0; i <= followUpCount; i++) {
    const message = await generateWithClaude({
      prompt: `Generate DM message ${i + 1}/${followUpCount + 1} for: ${purpose}. ${
        i > 0
          ? "This is a follow-up message. Be different from previous."
          : "This is the initial message. Make it compelling."
      }`,
      system: "Write concise, persuasive DMs under 160 characters. No emojis.",
      maxTokens: 200,
    });

    messages.push(message);
  }

  return messages;
}

// Generate product photography + description
export async function generateProductMarketing(
  productName: string,
  productDescription: string
): Promise<{
  images: string[];
  captions: string[];
  videoScript: string;
  quality: number;
}> {
  try {
    // Generate product images
    const images = await generateImage({
      prompt: `Professional product photography of ${productName}. ${productDescription}. Studio lighting, 8k, sharp focus, white background`,
      numOutputs: 5,
      width: 1024,
      height: 1024,
    });

    // Generate captions for each image
    const captions = await Promise.all([
      generateWithClaude({
        prompt: `Create Instagram caption for product: ${productName}`,
        maxTokens: 200,
      }),
      generateWithClaude({
        prompt: `Create TikTok caption for product: ${productName}`,
        maxTokens: 150,
      }),
      generateWithClaude({
        prompt: `Create Amazon listing description for: ${productName}`,
        maxTokens: 300,
      }),
    ]);

    // Generate video script
    const videoScript = await generateWithClaude({
      prompt: `Write a 30-second product demo script for: ${productName}`,
      system: "Write engaging, benefit-focused scripts. Include [ACTION] tags.",
      maxTokens: 300,
    });

    return {
      images,
      captions,
      videoScript,
      quality: 10,
    };
  } catch (error) {
    console.error("Product marketing generation error:", error);
    throw error;
  }
}

// Batch content generation (for bulk operations)
export async function batchGenerateContent(
  topics: string[],
  type: "caption" | "script" | "image"
): Promise<GeneratedContent[]> {
  const results: GeneratedContent[] = [];

  for (const topic of topics) {
    try {
      if (type === "caption") {
        const caption = await generateWithClaude({
          prompt: `Create viral caption for: ${topic}`,
          maxTokens: 200,
        });
        results.push({ caption });
      } else if (type === "script") {
        const script = await generateWithClaude({
          prompt: `Write 30s script for: ${topic}`,
          maxTokens: 300,
        });
        results.push({ script });
      } else if (type === "image") {
        const images = await generateImage({
          prompt: `Professional image of ${topic}`,
          numOutputs: 1,
        });
        results.push({ images });
      }
    } catch (error) {
      console.error(`Failed to generate for topic: ${topic}`, error);
    }
  }

  return results;
}

// AI-powered content optimization
export async function optimizeContent(content: string): Promise<{
  optimized: string;
  improvements: string[];
  score: number;
}> {
  const analysis = await generateWithClaude({
    prompt: `Optimize this content for engagement and add more power words:\n\n${content}`,
    system:
      "Improve engagement, clarity, and persuasiveness. Return JSON: {optimized: string, improvements: string[], score: 1-10}",
    maxTokens: 500,
  });

  try {
    return JSON.parse(analysis);
  } catch {
    return {
      optimized: content,
      improvements: ["Review the optimization analysis"],
      score: 5,
    };
  }
}

export default {
  generateCompleteContentKit,
  generateVideoPackage,
  generateDMSequence,
  generateProductMarketing,
  batchGenerateContent,
  optimizeContent,
};
