import { httpRequest } from "@/lib/api";
import { ThemeWithSignedUrlOutSchema } from "../schemas/theme.schema";

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
