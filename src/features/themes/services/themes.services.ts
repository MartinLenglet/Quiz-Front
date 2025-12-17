import { httpRequest } from "@/lib/api";
import { ThemeWithSignedUrlOutSchema } from "../schemas/themes.schemas";

export type ListPublicThemesParams = {
  offset?: number;
  limit?: number;
  ready_only?: boolean;
  validated_only?: boolean;
  category_id?: number | null;
  q?: string | null;
  newest_first?: boolean;
  with_signed_url?: boolean;
};

export function listPublicThemes(params: ListPublicThemesParams) {
  return httpRequest({
    method: "GET",
    path: "/themes/public",
    params,
    responseSchema: ThemeWithSignedUrlOutSchema.array(),
    withAuth: false,
  });
}

export type ListMyThemesParams = {
  offset?: number;
  limit?: number;
  ready_only?: boolean;
  public_only?: boolean;
  validated_only?: boolean;
  category_id?: number | null;
  q?: string | null;
  newest_first?: boolean;
  with_signed_url?: boolean;
};

export function listMyThemes(params: ListMyThemesParams) {
  return httpRequest({
    method: "GET",
    path: "/themes/me",
    params: {
      offset: params.offset ?? 0,
      limit: params.limit ?? 100,
      ready_only: params.ready_only ?? false,
      public_only: params.public_only ?? false,
      validated_only: params.validated_only ?? false,
      category_id: params.category_id ?? null,
      q: params.q ?? null,
      newest_first: params.newest_first ?? true,
      with_signed_url: params.with_signed_url ?? true,
    },
    responseSchema: ThemeWithSignedUrlOutSchema.array(),
    // withAuth: true (défaut) -> Bearer si présent + refresh auto si 401
  });
}