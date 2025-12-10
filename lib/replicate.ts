import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export interface ImageGenerationOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  numOutputs?: number;
  guidanceScale?: number;
  numInferenceSteps?: number;
}

/**
 * Generate high-quality images using FLUX (better than Stable Diffusion)
 * - Replicate provides access to FLUX, Midjourney-quality models
 * - Much faster than Midjourney, better quality than DALL-E 3
 */
export async function generateImage(
  options: ImageGenerationOptions
): Promise<string[]> {
  try {
    const output = await replicate.run(
      "black-forest-labs/flux-pro",
      {
        input: {
          prompt: options.prompt,
          negative_prompt:
            options.negativePrompt || "blurry, low quality, distorted",
          guidance_scale: options.guidanceScale || 7.5,
          num_inference_steps: options.numInferenceSteps || 50,
          width: options.width || 1024,
          height: options.height || 1024,
          num_outputs: options.numOutputs || 1,
        },
      }
    );

    return Array.isArray(output) ? output : [output as string];
  } catch (error) {
    console.error("Image generation error:", error);
    throw error;
  }
}

/**
 * Generate product photography images
 */
export async function generateProductImage(
  productName: string,
  style: string = "professional studio photography"
): Promise<string[]> {
  return generateImage({
    prompt: `${productName}, ${style}, 8k, professional, sharp focus, product photography, white background`,
    negativePrompt: "blurry, low quality, watermark, text, distorted",
    width: 1024,
    height: 1024,
    numOutputs: 1,
  });
}

/**
 * Generate portrait/avatar images
 */
export async function generatePortrait(
  description: string,
  style: string = "professional headshot"
): Promise<string[]> {
  return generateImage({
    prompt: `${description}, ${style}, professional portrait, beautiful lighting, sharp focus, 8k`,
    negativePrompt: "blurry, low quality, multiple people, watermark",
    width: 512,
    height: 768,
    numOutputs: 1,
  });
}

/**
 * Generate social media post images
 */
export async function generateSocialPostImage(
  topic: string,
  platform: "instagram" | "tiktok" | "pinterest" = "instagram"
): Promise<string[]> {
  const dimensions = {
    instagram: { width: 1080, height: 1080 },
    tiktok: { width: 1080, height: 1920 },
    pinterest: { width: 1000, height: 1500 },
  };

  const dim = dimensions[platform];

  return generateImage({
    prompt: `Professional ${platform} post about ${topic}, trending, high quality, vibrant colors, eye-catching design`,
    negativePrompt: "blurry, low quality, text overlay, watermark",
    width: dim.width,
    height: dim.height,
    numOutputs: 1,
  });
}

/**
 * Generate video using Replicate (text-to-video)
 */
export async function generateVideo(
  prompt: string,
  duration: number = 6 // seconds
): Promise<string> {
  try {
    const output = await replicate.run("gen-2", {
      input: {
        prompt_template: prompt,
        duration: duration,
      },
    });

    return output as string;
  } catch (error) {
    console.error("Video generation error:", error);
    throw error;
  }
}

/**
 * Upscale/enhance an image using ESRGAN
 */
export async function upscaleImage(imageUrl: string): Promise<string> {
  try {
    const output = await replicate.run("nightmareai/real-esrgan", {
      input: {
        image: imageUrl,
      },
    });

    return output as string;
  } catch (error) {
    console.error("Image upscale error:", error);
    throw error;
  }
}

export default replicate;
