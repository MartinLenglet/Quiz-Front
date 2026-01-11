import { z } from "zod";

import { QuestionJoinWithSignedUrlOutSchema } from "@/features/questions/schemas/questions.schemas";

export const ThemeOutSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional().nullable(),
  image_id: z.number().optional().nullable(),

  category_id: z.number().optional().nullable(),
  category_name: z.string().optional().nullable(),
  category_color_hex: z.string().optional().nullable(),

  owner_id: z.number(),
  owner_username: z.string().optional().nullable(),

  is_public: z.boolean(),
  is_ready: z.boolean(),
  valid_admin: z.boolean(),

  created_at: z.string().optional().nullable(), // datetime JSON -> string
  updated_at: z.string().optional().nullable(),
});

export type ThemeOut = z.infer<typeof ThemeOutSchema>;

export const ThemeWithSignedUrlOutSchema = ThemeOutSchema.extend({
  image_signed_url: z.string().optional().nullable(),
  image_signed_expires_in: z.number().optional().nullable(),
});

export type ThemeWithSignedUrlOut = z.infer<typeof ThemeWithSignedUrlOutSchema>;

// Schéma pour les objets "join" renvoyés par certaines routes (ex: list public)
export const ThemeJoinOutSchema = ThemeOutSchema.extend({
  category_name: z.string().optional().nullable(),
  category_color_hex: z.string().optional().nullable(),
  owner_username: z.string().optional().nullable(),
  questions_count: z.number().int().optional().default(0),
});

export const ThemeJoinWithSignedUrlOutSchema = ThemeJoinOutSchema.extend({
  image_signed_url: z.string().optional().nullable(),
  image_signed_expires_in: z.number().optional().nullable(),
});

export type ThemeJoinWithSignedUrlOut = z.infer<typeof ThemeJoinWithSignedUrlOutSchema>;

export const ThemeDetailJoinWithSignedUrlOutSchema = ThemeJoinWithSignedUrlOutSchema.extend({
  questions: z.array(QuestionJoinWithSignedUrlOutSchema).default([]),
});

export type ThemeDetailJoinWithSignedUrlOut = z.infer<
  typeof ThemeDetailJoinWithSignedUrlOutSchema
>;

export const ThemeCreateInSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),
  image_id: z.number(),

  category_id: z.number(),
  is_public: z.boolean(),
  is_ready: z.boolean(),
  valid_admin: z.boolean(),
  owner_id: z.number(),
});

export type ThemeCreateIn = z.infer<typeof ThemeCreateInSchema>;

export const ThemeCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string(), // ex: "#FF4D4F"
});

export type ThemeCategory = z.infer<typeof ThemeCategorySchema>;

export const ThemeCategoriesResponseSchema = z.object({
  items: ThemeCategorySchema.array(),
});

export type ThemeCategoriesResponse = z.infer<typeof ThemeCategoriesResponseSchema>;

// Le backend peut renvoyer des structures variées pour l'endpoint "preview".
// Plutôt que d'imposer un contrat précis ici (qui diverge souvent), on accepte
// n'importe quel payload et on le traite côté UI de façon permissive.
export const QuestionStatOutSchema = z.object({
  question_id: z.number(),
  points: z.number().optional().default(0),
  positive_answers_count: z.number().optional().default(0),
  negative_answers_count: z.number().optional().default(0),
  cancelled_answers_count: z.number().optional().default(0),
});

export const ThemePreviewSchema = ThemeJoinWithSignedUrlOutSchema.extend({
  plays_count: z.number().int().optional().default(0),
  question_stats: QuestionStatOutSchema.array().optional().default([]),
});

export type ThemePreviewOut = z.infer<typeof ThemePreviewSchema>;