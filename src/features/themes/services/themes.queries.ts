import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createTheme } from "./themes.services";
import { listPublicThemes, type ListPublicThemesParams, listMyThemes, type ListMyThemesParams, getThemeCategories, getThemeById, updateThemeWithQuestions, type ThemeUpdateWithQuestionsIn, getThemePreview } from "./themes.services";
import type { ThemeOut, ThemeCreateIn, ThemeCategory, ThemeDetailJoinWithSignedUrlOut, ThemePreviewOut } from "../schemas/themes.schemas";

export function usePublicThemes(params: ListPublicThemesParams) {
  return useQuery({
    queryKey: ["themes", "public", params],
    queryFn: () => listPublicThemes(params),
    staleTime: 5 * 60_000,          // ex: 5 min
    refetchInterval: 4 * 60_000,    // ex: 4 min (avant staleTime/TTL)
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useMyThemesQuery(params: ListMyThemesParams) {
  return useQuery({
    queryKey: ["themes", "me", params],
    queryFn: () => listMyThemes(params),
    staleTime: 30_000,
  });
}

export function useCreateThemeMutation() {
  return useMutation<ThemeOut, Error, { input: ThemeCreateIn }>({
    mutationFn: ({ input }) => createTheme(input),
  });
}

export function useCategoriesQuery() {
  return useQuery<ThemeCategory[], Error>({
    queryKey: ["themes", "categories"],
    queryFn: async () => {
      const res = await getThemeCategories();
      return res.items;
    },
    staleTime: 10 * 60 * 1000, // 10 min
    placeholderData: (prev) => prev,
  });
}

export function useThemeByIdQuery(themeId: number | null) {
  return useQuery<ThemeDetailJoinWithSignedUrlOut, Error>({
    queryKey: ["themes", "byId", themeId],
    queryFn: async () => {
      if (!themeId) throw new Error("themeId manquant");
      return getThemeById(themeId, { with_signed_url: true });
    },
    enabled: typeof themeId === "number" && Number.isFinite(themeId),
    staleTime: 30 * 1000,
  });
}

export function useThemePreviewQuery(themeId: number | null) {
  return useQuery<ThemePreviewOut, Error>({
    queryKey: ["themes", "preview", themeId],
    queryFn: async () => {
      if (!themeId) throw new Error("themeId manquant");
      return getThemePreview(themeId);
    },
    enabled: typeof themeId === "number" && Number.isFinite(themeId),
    staleTime: 30 * 1000,
  });
}

export function useUpdateThemeWithQuestionsMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (args: { themeId: number; input: ThemeUpdateWithQuestionsIn }) =>
      updateThemeWithQuestions(args.themeId, args.input),
    onSuccess: (_data, vars) => {
      // à adapter selon tes queryKeys existantes
      qc.invalidateQueries({ queryKey: ["themes", "byId", vars.themeId] });
      qc.invalidateQueries({ queryKey: ["themes", "me"] });
      qc.invalidateQueries({ queryKey: ["themes", "public"] });
    },
  });
}
