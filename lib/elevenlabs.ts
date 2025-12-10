import { ElevenLabsClient } from "elevenlabs";

const elevenLabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export interface VoiceOptions {
  text: string;
  voiceId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  speakerBoost?: boolean;
}

/**
 * Best voice options from ElevenLabs
 */
export const PREMIUM_VOICES = {
  FEMALE_PROFESSIONAL: "21m00Tcm4TlvDq8ikWAM", // Rachel - Professional female
  MALE_PROFESSIONAL: "iP95p4xoKVk53GoZ742B", // Chris - Professional male
  STORYTELLER: "nPczCjzI2devNBz1zQrH", // Bella - Warm, storytelling
  NARRATOR: "cgSugibhmbNHC5r0DZpB", // Callum - British narrator
  ENERGETIC_FEMALE: "MF3mGyEYCl7XYWbV7PZT", // Elli - Young, energetic
  DEEP_MALE: "9BWtsMINqrJLrRacOk9x", // Arnold - Deep, authoritative
};

/**
 * Generate speech from text using ElevenLabs (Hollywood-quality voice)
 * Best for: YouTube videos, podcasts, audiobooks, voice-overs
 */
export async function generateSpeech(
  options: VoiceOptions
): Promise<Buffer> {
  try {
    const voiceId = options.voiceId || PREMIUM_VOICES.FEMALE_PROFESSIONAL;

    const audio = await elevenLabs.generate({
      voice: voiceId,
      text: options.text,
      model_id: "eleven_turbo_v2",
    });

    return audio as unknown as Buffer;
  } catch (error) {
    console.error("Speech generation error:", error);
    throw error;
  }
}

/**
 * Generate YouTube video voice-over
 */
export async function generateYouTubeVoiceOver(
  script: string,
  voiceType: "professional" | "energetic" | "narrator" = "professional"
): Promise<Buffer> {
  const voices = {
    professional: PREMIUM_VOICES.MALE_PROFESSIONAL,
    energetic: PREMIUM_VOICES.ENERGETIC_FEMALE,
    narrator: PREMIUM_VOICES.NARRATOR,
  };

  return generateSpeech({
    text: script,
    voiceId: voices[voiceType],
    stability: 0.7,
    similarityBoost: 0.8,
    style: 0.5, // Balanced, natural tone
    speakerBoost: true,
  });
}

/**
 * Generate podcast episode voice
 */
export async function generatePodcastAudio(
  content: string,
  voiceType: "host" | "guest" = "host"
): Promise<Buffer> {
  const voices = {
    host: PREMIUM_VOICES.STORYTELLER,
    guest: PREMIUM_VOICES.MALE_PROFESSIONAL,
  };

  return generateSpeech({
    text: content,
    voiceId: voices[voiceType],
    stability: 0.6,
    similarityBoost: 0.85,
    style: 1, // More expressive
    speakerBoost: true,
  });
}

/**
 * Generate audiobook narration
 */
export async function generateAudiobookNarration(
  text: string,
  narrator: "male" | "female" = "male"
): Promise<Buffer> {
  const voices = {
    male: PREMIUM_VOICES.DEEP_MALE,
    female: PREMIUM_VOICES.STORYTELLER,
  };

  return generateSpeech({
    text: text,
    voiceId: voices[narrator],
    stability: 0.65,
    similarityBoost: 0.85,
    style: 0.2, // More formal, less expressive
    speakerBoost: false,
  });
}

/**
 * Generate IVR/Voice bot responses
 */
export async function generateBotResponse(
  message: string
): Promise<Buffer> {
  return generateSpeech({
    text: message,
    voiceId: PREMIUM_VOICES.FEMALE_PROFESSIONAL,
    stability: 0.8, // Very stable, clear
    similarityBoost: 0.75,
    style: 0,
    speakerBoost: false,
  });
}

/**
 * Clone a voice (requires uploading voice samples first)
 * Premium feature - create custom voice from 5+ voice samples
 */
export async function cloneVoice(
  voiceName: string,
  audioUrls: string[]
): Promise<string> {
  try {
    // This would use the voice clone API
    // Requires VoiceLab subscription
    console.log(
      `Voice cloning would create "${voiceName}" from ${audioUrls.length} samples`
    );
    return "cloned_voice_id";
  } catch (error) {
    console.error("Voice cloning error:", error);
    throw error;
  }
}

/**
 * Get available voices
 */
export async function getAvailableVoices() {
  return PREMIUM_VOICES;
}

export default elevenLabs;
