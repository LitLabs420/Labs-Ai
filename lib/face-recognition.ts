/**
 * Face Recognition Service
 * Biometric authentication and identity verification
 */

import { captureError } from "@/lib/sentry";
import { supabase } from "@/lib/database";

export interface FaceProfile {
  id: string;
  userId: string;
  faceDescriptor: number[]; // Embedding vector
  label: string; // Primary identifier name
  confidence: number; // 0-1
  isVerified: boolean;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FaceRecognitionResult {
  matched: boolean;
  userId?: string;
  confidence: number;
  label?: string;
}

/**
 * Register face for biometric authentication
 * In production, use a service like AWS Rekognition, Azure Face API, or Face++
 */
export async function registerFace(
  userId: string,
  imageBuffer: Buffer,
  label: string = "primary"
): Promise<FaceProfile | null> {
  try {
    // In a real implementation, send to face recognition API
    // For now, create a placeholder with mock embedding
    const mockEmbedding = generateMockEmbedding();

    const { data, error } = await supabase
      .from("face_profiles")
      .insert({
        user_id: userId,
        face_descriptor: mockEmbedding,
        label,
        confidence: 0.95,
        is_verified: true,
        is_primary: label === "primary",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as FaceProfile;
  } catch (error) {
    captureError("Failed to register face", { error });
    return null;
  }
}

/**
 * Verify user identity via face recognition
 */
export async function verifyFace(
  userId: string,
  imageBuffer: Buffer,
  requiredConfidence: number = 0.85
): Promise<{ verified: boolean; confidence: number }> {
  try {
    // Get user's registered faces
    const { data: faces, error } = await supabase
      .from("face_profiles")
      .select("*")
      .eq("user_id", userId);

    if (error || !faces || faces.length === 0) {
      return { verified: false, confidence: 0 };
    }

    // In production, extract descriptor from image and compare with stored descriptors
    const imageEmbedding = generateMockEmbedding();

    let bestMatch = 0;
    for (const face of faces) {
      const similarity = calculateEmbeddingSimilarity(
        imageEmbedding,
        face.face_descriptor
      );
      bestMatch = Math.max(bestMatch, similarity);
    }

    const verified = bestMatch >= requiredConfidence;
    return { verified, confidence: bestMatch };
  } catch (error) {
    captureError("Face verification failed", { error });
    return { verified: false, confidence: 0 };
  }
}

/**
 * Identify user from face (1:N matching)
 */
export async function identifyFace(
  imageBuffer: Buffer,
  requiredConfidence: number = 0.85
): Promise<FaceRecognitionResult> {
  try {
    // Get all registered faces
    const { data: allFaces, error } = await supabase
      .from("face_profiles")
      .select("user_id, face_descriptor, label");

    if (error || !allFaces) {
      return { matched: false, confidence: 0 };
    }

    const imageEmbedding = generateMockEmbedding();
    let bestMatch: (typeof allFaces)[0] | null = null;
    let bestSimilarity = 0;

    for (const face of allFaces) {
      const similarity = calculateEmbeddingSimilarity(
        imageEmbedding,
        face.face_descriptor
      );
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = face;
      }
    }

    if (!bestMatch || bestSimilarity < requiredConfidence) {
      return { matched: false, confidence: 0 };
    }

    return {
      matched: true,
      userId: bestMatch.user_id,
      confidence: bestSimilarity,
      label: bestMatch.label,
    };
  } catch (error) {
    captureError("Face identification failed", { error });
    return { matched: false, confidence: 0 };
  }
}

/**
 * List all registered faces for a user
 */
export async function listFaces(userId: string): Promise<FaceProfile[]> {
  try {
    const { data, error } = await supabase
      .from("face_profiles")
      .select("*")
      .eq("user_id", userId)
      .order("is_primary", { ascending: false });

    if (error) throw error;
    return (data || []) as FaceProfile[];
  } catch (error) {
    captureError("Failed to list faces", { error });
    return [];
  }
}

/**
 * Delete a face profile
 */
export async function deleteFace(userId: string, faceId: string): Promise<boolean> {
  try {
    // Don't allow deleting primary if there are other faces
    const faces = await listFaces(userId);
    const faceToDelete = faces.find((f) => f.id === faceId);

    if (faceToDelete?.isPrimary && faces.length > 1) {
      throw new Error("Cannot delete primary face when other faces exist");
    }

    const { error } = await supabase
      .from("face_profiles")
      .delete()
      .eq("id", faceId)
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  } catch (error) {
    captureError("Failed to delete face", { error });
    return false;
  }
}

/**
 * Update face profile (e.g., set as primary)
 */
export async function updateFace(
  userId: string,
  faceId: string,
  updates: Partial<FaceProfile>
): Promise<FaceProfile | null> {
  try {
    const { data, error } = await supabase
      .from("face_profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", faceId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data as FaceProfile;
  } catch (error) {
    captureError("Failed to update face profile", { error });
    return null;
  }
}

/**
 * Log face authentication attempt
 */
export async function logFaceAuth(
  userId: string,
  success: boolean,
  confidence: number,
  metadata: Record<string, any> = {}
): Promise<boolean> {
  try {
    await supabase.from("face_auth_logs").insert({
      user_id: userId,
      success,
      confidence,
      metadata,
      timestamp: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    captureError("Failed to log face auth", { error });
    return false;
  }
}

/**
 * Generate mock embedding (128-dimensional vector)
 * In production, use actual face detection library (face-api.js, TensorFlow.js, etc.)
 */
function generateMockEmbedding(): number[] {
  const size = 128;
  const embedding = new Array(size);
  for (let i = 0; i < size; i++) {
    embedding[i] = Math.random() * 2 - 1; // Range [-1, 1]
  }
  return embedding;
}

/**
 * Calculate cosine similarity between two embeddings
 */
function calculateEmbeddingSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) return 0;

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }

  const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
  if (denominator === 0) return 0;

  return (dotProduct / denominator + 1) / 2; // Normalize to [0, 1]
}

export default {
  registerFace,
  verifyFace,
  identifyFace,
  listFaces,
  deleteFace,
  updateFace,
  logFaceAuth,
};
