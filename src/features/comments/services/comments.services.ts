import { httpRequest } from "@/lib/api";
import {
  ThemeCommentCreateInSchema,
  ThemeCommentOutSchema,
  ThemeCommentUpdateInSchema,
  type ThemeCommentOut,
} from "../schemas/comments.schemas";

export async function createThemeComment(payload: unknown): Promise<ThemeCommentOut> {
  const parsed = ThemeCommentCreateInSchema.parse(payload);

  return httpRequest<ThemeCommentOut>({
    method: "POST",
    path: "/comments",
    body: parsed,
    responseSchema: ThemeCommentOutSchema,
    withAuth: true,
  });
}

export async function updateThemeComment(commentId: number, payload: unknown): Promise<ThemeCommentOut> {
  const parsed = ThemeCommentUpdateInSchema.parse(payload);

  return httpRequest<ThemeCommentOut>({
    method: "PATCH",
    path: `/comments/${commentId}`,
    body: parsed,
    responseSchema: ThemeCommentOutSchema,
    withAuth: true,
  });
}

export async function deleteThemeComment(commentId: number): Promise<void> {
  await httpRequest<void>({
    method: "DELETE",
    path: `/comments/${commentId}`,
    withAuth: true,
  });
}
