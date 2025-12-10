import { z } from "zod";

/**
 * Authentication validators
 */

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().optional(),
  username: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

/**
 * User validators
 */

export const UpdateProfileSchema = z.object({
  displayName: z.string().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  avatarUrl: z.string().url("Invalid avatar URL").optional(),
  themeId: z.string().optional(),
});

export const UpdateSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  twoFactorEnabled: z.boolean().optional(),
  theme: z.enum(["light", "dark", "auto"]).optional(),
});

/**
 * Subscription validators
 */

export const CheckLimitsSchema = z.object({
  operation: z.enum([
    "ai_generation",
    "dm_reply",
    "image_generation",
    "social_post",
    "bot_creation",
  ]),
});

/**
 * Marketplace validators
 */

export const CreateMarketplaceItemSchema = z.object({
  type: z.enum(["bot", "theme", "widget", "automation", "plugin"]),
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().min(0, "Price must be non-negative"),
  previewUrl: z.string().url("Invalid preview URL").optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * Bot validators
 */

export const CreateBotSchema = z.object({
  name: z.string().min(1, "Bot name is required"),
  description: z.string().optional(),
  personality: z.string().optional(),
  engine: z.enum(["openai", "google", "claude", "hybrid"]),
  avatarUrl: z.string().url().optional(),
  visibility: z.enum(["private", "shared", "public"]).default("private"),
});

/**
 * Template validators
 */

export const SaveTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  type: z.enum(["caption", "script", "dm", "moneyPlay", "image"]),
  content: z.string().min(1, "Template content is required"),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(false),
});

/**
 * Referral validators
 */

export const CreateReferralSchema = z.object({
  code: z.string().min(3, "Referral code must be at least 3 characters"),
  description: z.string().optional(),
});

/**
 * Email validators
 */

export const SendEmailSchema = z.object({
  recipientEmail: z.string().email("Invalid recipient email"),
  subject: z.string().min(1, "Subject is required"),
  template: z.string().optional(),
  variables: z.record(z.string(), z.any()).optional(),
});
