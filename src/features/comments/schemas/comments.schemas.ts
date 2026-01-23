import { z } from "zod";

export const ThemeCommentOutSchema = z.object({
  id: z.number(),
  game_id: z.number(),
  theme_id: z.number(),
  score: z.number().int().min(0).max(5),
  comment: z.string().optional().nullable(),
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
  game_owner_id: z.number(),
  game_owner_username: z.string().optional().nullable(),
});

export type ThemeCommentOut = z.infer<typeof ThemeCommentOutSchema>;

export const ThemeCommentListOutSchema = z.object({
  items: ThemeCommentOutSchema.array(),
  total: z.number().int(),
});

export type ThemeCommentListOut = z.infer<typeof ThemeCommentListOutSchema>;

export const ThemeCommentCreateInSchema = z.object({
  game_id: z.number(),
  theme_id: z.number(),
  score: z.number().int().min(0).max(5),
  comment: z.string().optional().nullable(),
});

export type ThemeCommentCreateIn = z.infer<typeof ThemeCommentCreateInSchema>;

export const ThemeCommentUpdateInSchema = z.object({
  score: z.number().int().min(0).max(5).optional(),
  comment: z.string().optional().nullable(),
});

export type ThemeCommentUpdateIn = z.infer<typeof ThemeCommentUpdateInSchema>;
