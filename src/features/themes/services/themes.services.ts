import { httpRequest } from "@/lib/api";
import { ThemeWithSignedUrlOutSchema, ThemeOutSchema, ThemeDetailJoinWithSignedUrlOutSchema, type ThemeOut, type ThemeCreateIn, type ThemeDetailJoinWithSignedUrlOut, ThemePreviewSchema, ThemeJoinWithSignedUrlOutSchema } from "../schemas/themes.schemas";
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
    // backend returns joined objects with category/owner for public list
    responseSchema: ThemeJoinWithSignedUrlOutSchema.array(),
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
    // owner list also returns joined objects
    responseSchema: ThemeJoinWithSignedUrlOutSchema.array(),
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

export async function getThemeById(themeId: number, params?: { with_signed_url?: boolean }): Promise<ThemeDetailJoinWithSignedUrlOut> {
  return httpRequest<ThemeDetailJoinWithSignedUrlOut>({
    method: "GET",
    path: `/themes/${themeId}`,
    withAuth: true,
    params: {
      with_signed_url: params?.with_signed_url ?? true,
    },
    responseSchema: ThemeDetailJoinWithSignedUrlOutSchema,
  });
}

export async function getThemePreview(themeId: number) {
  return httpRequest<import("../schemas/themes.schemas").ThemePreviewOut>({
    method: "GET",
    path: `/themes/${themeId}/preview`,
    withAuth: false,
    responseSchema: ThemePreviewSchema,
  });
}

export type ThemeQuestionUpsertIn = {
  // optionnel si ton backend ne le prend pas : garde uniquement si supporté
  id?: number;

  question: string;
  answer: string;
  points: number;

  question_image_id?: number | null;
  answer_image_id?: number | null;
  question_audio_id?: number | null;
  answer_audio_id?: number | null;
  question_video_id?: number | null;
  answer_video_id?: number | null;
};

export type ThemeUpdateWithQuestionsIn = {
  name?: string;
  description?: string | null;
  image_id?: number | null;
  category_id?: number | null;
  is_public?: boolean;
  is_ready?: boolean;
  valid_admin?: boolean;
  owner_id?: number | null;

  questions: ThemeQuestionUpsertIn[];
};

export async function updateThemeWithQuestions(themeId: number, input: ThemeUpdateWithQuestionsIn) {
  return httpRequest<ThemeDetailJoinWithSignedUrlOut>({
    method: "PATCH",
    path: `/themes/${themeId}`,
    body: input,
    // ✅ pour récupérer les signed urls après update
    params: { with_signed_url: true },
    responseSchema: ThemeDetailJoinWithSignedUrlOutSchema,
    withAuth: true,
  });
}