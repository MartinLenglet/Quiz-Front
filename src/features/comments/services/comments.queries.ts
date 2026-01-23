import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createThemeComment,
  updateThemeComment,
  deleteThemeComment,
} from "./comments.services";
import type { ThemeCommentCreateIn, ThemeCommentOut, ThemeCommentUpdateIn } from "../schemas/comments.schemas";

export const commentsKeys = {
  all: ["comments"] as const,
  byTheme: (themeId: number) => [...commentsKeys.all, "theme", themeId] as const,
};

export function useCreateThemeCommentMutation(themeId: number) {
  const qc = useQueryClient();

  return useMutation<ThemeCommentOut, Error, { payload: ThemeCommentCreateIn }>(
    {
      mutationFn: ({ payload }) => createThemeComment(payload),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: commentsKeys.byTheme(themeId) });
        qc.invalidateQueries({ queryKey: ["themes", "preview", themeId] });
      },
    }
  );
}

export function useUpdateThemeCommentMutation(themeId: number, commentId: number) {
  const qc = useQueryClient();

  return useMutation<ThemeCommentOut, Error, { payload: ThemeCommentUpdateIn }>(
    {
      mutationFn: ({ payload }) => updateThemeComment(commentId, payload),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: commentsKeys.byTheme(themeId) });
        qc.invalidateQueries({ queryKey: ["themes", "preview", themeId] });
      },
    }
  );
}

export function useDeleteThemeCommentMutation(themeId: number, commentId: number) {
  const qc = useQueryClient();

  return useMutation<void, Error>(
    {
      mutationFn: () => deleteThemeComment(commentId),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: commentsKeys.byTheme(themeId) });
        qc.invalidateQueries({ queryKey: ["themes", "preview", themeId] });
      },
    }
  );
}
