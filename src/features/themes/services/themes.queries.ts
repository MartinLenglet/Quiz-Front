import { useQuery } from "@tanstack/react-query";
import { listPublicThemes, type ListPublicThemesParams, listMyThemes, type ListMyThemesParams } from "./themes.services";

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