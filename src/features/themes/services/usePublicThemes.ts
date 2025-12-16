import { useQuery } from "@tanstack/react-query";
import { listPublicThemes, type ListPublicThemesParams } from "./theme.services";

export function usePublicThemes(params: ListPublicThemesParams) {
  return useQuery({
    queryKey: ["themes", "public", params],
    queryFn: () => listPublicThemes(params),
    staleTime: 30_000, // utile car URLs signées peuvent expirer
  });
}
