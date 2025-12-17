import { z } from "zod";

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
