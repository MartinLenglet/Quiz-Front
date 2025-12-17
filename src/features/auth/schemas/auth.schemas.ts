import { z } from "zod";

/**
 * Inputs (alignés sur le backend)
 */

export const SignUpInSchema = z.object({
  username: z.string().min(3).max(64),
  password: z.string().min(8).max(128),
});
export type SignUpIn = z.infer<typeof SignUpInSchema>;

export const SignInInSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
export type SignInIn = z.infer<typeof SignInInSchema>;

export const RefreshInSchema = z.object({
  refresh_token: z.string().min(1),
});
export type RefreshIn = z.infer<typeof RefreshInSchema>;

export const LogoutInSchema = z.object({
  refresh_token: z.string().min(1),
});
export type LogoutIn = z.infer<typeof LogoutInSchema>;

export const ChangePasswordInSchema = z.object({
  old_password: z.string().min(1),
  new_password: z.string().min(8).max(128),
});
export type ChangePasswordIn = z.infer<typeof ChangePasswordInSchema>;

/**
 * Outputs (alignés sur le backend)
 */

export const TokenPairOutSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  token_type: z.string().min(1), // "bearer"
  expires_in: z.number().int().positive(), // secondes
});
export type TokenPairOut = z.infer<typeof TokenPairOutSchema>;

export const UserOutSchema = z.object({
  id: z.number().int(),
  username: z.string().min(1),
  admin: z.boolean(),
});
export type UserOut = z.infer<typeof UserOutSchema>;
