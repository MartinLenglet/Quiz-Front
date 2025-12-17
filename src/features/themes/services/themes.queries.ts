import { useQuery, useMutation } from "@tanstack/react-query";
import { createTheme } from "./themes.services";
import { listPublicThemes, type ListPublicThemesParams, listMyThemes, type ListMyThemesParams, getThemeCategories } from "./themes.services";
import type { ThemeOut, ThemeCreateIn, ThemeCategory } from "../schemas/themes.schemas";

export function usePublicThemes(params: ListPublicThemesParams) {
  return useQuery({
    queryKey: ["themes", "public", params],
    queryFn: () => listPublicThemes(params),
    staleTime: 30_000, // utile car URLs signées peuvent expirer
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
  });
}