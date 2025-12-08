import axios from 'axios';
import { z } from 'zod';

interface GenerateContentRequest {
  type: 'caption' | 'script' | 'dm' | 'image';
  platform?: 'instagram' | 'tiktok' | 'youtube' | 'twitter';
  topic: string;
  tone?: 'casual' | 'professional' | 'funny' | 'inspirational';
  length?: 'short' | 'medium' | 'long';
}

interface GeneratedContent {
  id: string;
  type: string;
  content: string;
  platform?: string;
  createdAt: string;
  saved: boolean;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export async function generateContent(
  request: GenerateContentRequest,
  token: string
): Promise<GeneratedContent> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/ai/generate-content`,
      request,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate content';
    throw new Error(message);
  }
}

export async function saveContent(
  content: GeneratedContent,
  token: string
): Promise<void> {
  try {
    await axios.post(
      `${API_BASE_URL}/api/templates`,
      {
        title: `${content.type} - ${new Date().toLocaleDateString()}`,
        type: content.type,
        content: content.content,
        platform: content.platform,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save content';
    throw new Error(message);
  }
}

export async function deleteContent(
  contentId: string,
  token: string
): Promise<void> {
  try {
    await axios.delete(
      `${API_BASE_URL}/api/templates/${contentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete content';
    throw new Error(message);
  }
}

export async function getGeneratedHistory(token: string): Promise<GeneratedContent[]> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/templates`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.data || [];
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch history';
    throw new Error(message);
  }
}
