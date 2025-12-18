// src/features/questions/schemas/questions.schemas.ts
import { z } from "zod";

export const QuestionOutSchema = z.object({
  id: z.number(),
  theme_id: z.number(),

  question: z.string(),
  answer: z.string(),
  points: z.number().int().min(0),

  question_image_id: z.number().optional().nullable(),
  answer_image_id: z.number().optional().nullable(),

  question_audio_id: z.number().optional().nullable(),
  answer_audio_id: z.number().optional().nullable(),

  question_video_id: z.number().optional().nullable(),
  answer_video_id: z.number().optional().nullable(),

  created_at: z.string().optional().nullable(), // datetime JSON -> string
  updated_at: z.string().optional().nullable(),
});

export type QuestionOut = z.infer<typeof QuestionOutSchema>;

export const QuestionJoinWithSignedUrlOutSchema = QuestionOutSchema.extend({
  question_image_signed_url: z.string().optional().nullable(),
  question_image_signed_expires_in: z.number().int().optional().nullable(),

  answer_image_signed_url: z.string().optional().nullable(),
  answer_image_signed_expires_in: z.number().int().optional().nullable(),

  question_audio_signed_url: z.string().optional().nullable(),
  question_audio_signed_expires_in: z.number().int().optional().nullable(),

  answer_audio_signed_url: z.string().optional().nullable(),
  answer_audio_signed_expires_in: z.number().int().optional().nullable(),

  question_video_signed_url: z.string().optional().nullable(),
  question_video_signed_expires_in: z.number().int().optional().nullable(),

  answer_video_signed_url: z.string().optional().nullable(),
  answer_video_signed_expires_in: z.number().int().optional().nullable(),
});

export type QuestionJoinWithSignedUrlOut = z.infer<typeof QuestionJoinWithSignedUrlOutSchema>;
