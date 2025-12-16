import { httpGet } from "@/lib/api";
import type { ThemeWithSignedUrlOut } from "../schemas/theme.schema";

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
  return httpGet<ThemeWithSignedUrlOut[]>("/themes/public", params);
}
