import { httpRequest } from "@/lib/api";
import { ThemeWithSignedUrlOutSchema, ThemeOutSchema, type ThemeOut, type ThemeCreateIn } from "../schemas/themes.schemas";
import { 
  ThemeCategoriesResponseSchema,
  type ThemeCategoriesResponse, 
} from "../schemas/themes.schemas";

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

export async function createTheme(input: ThemeCreateIn): Promise<ThemeOut> {
  return httpRequest<ThemeOut>({
    method: "POST",
    path: "/themes", // ✅ SANS /v1
    body: input,
    responseSchema: ThemeOutSchema,
    withAuth: true,
  });
}

export async function getThemeCategories(): Promise<ThemeCategoriesResponse> {
  return httpRequest<ThemeCategoriesResponse>({
    method: "GET",
    path: "/themes/categories",
    withAuth: false,
    responseSchema: ThemeCategoriesResponseSchema,
  });
}

export async function getThemeById(themeId: number): Promise<ThemeOut> {
  return httpRequest<ThemeOut>({
    method: "GET",
    path: `/themes/${themeId}`,
    withAuth: true,
    responseSchema: ThemeOutSchema,
  });
}