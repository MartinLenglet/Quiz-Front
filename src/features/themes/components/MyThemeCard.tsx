import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { z } from "zod";
import type { ThemeWithSignedUrlOutSchema } from "../schemas/themes.schemas";

type Theme = z.infer<typeof ThemeWithSignedUrlOutSchema>;

type Props = {
  theme: Theme;
  onEdit?: (themeId: number) => void;
};

export function MyThemeCard({ theme, onEdit }: Props) {
  return (
    <Card className="m-2">
      {/* Image toujours affichée (avec fallback si pas d’URL signée) */}
      <div className="overflow-hidden rounded-t-lg border-b">
        {theme.image_signed_url ? (
          <img
            src={theme.image_signed_url}
            alt={`Illustration du thème ${theme.name}`}
            className="h-48 w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-48 w-full items-center justify-center bg-muted text-sm text-muted-foreground">
            Aucune image
          </div>
        )}
      </div>

      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base">{theme.name}</CardTitle>

          <div className="flex flex-wrap justify-end gap-2">
            <Badge variant={theme.is_public ? "default" : "secondary"}>
              {theme.is_public ? "Public" : "Privé"}
            </Badge>
            <Badge variant={theme.is_ready ? "default" : "outline"}>
              {theme.is_ready ? "Prêt" : "Brouillon"}
            </Badge>
            <Badge variant={theme.valid_admin ? "default" : "destructive"}>
              {theme.valid_admin ? "Validé" : "Non validé"}
            </Badge>
          </div>
        </div>

        {/* On garde l’emplacement, mais on transforme la catégorie en badge coloré (texte blanc) */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge
            className="border-0 text-white"
            style={{ backgroundColor: theme.category_color_hex ?? undefined }}
          >
            {theme.category_name}
          </Badge>

          <span aria-hidden="true">•</span>
          <span>@{theme.owner_username}</span>

          <div className="ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(theme.id)}
            >
              Modifier
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">{theme.description}</p>

        <div className="text-xs text-muted-foreground">
          {theme.created_at
            ? <>Créé le {new Date(theme.created_at).toLocaleString()}</>
            : <>Date de création inconnue</>
          }

          {theme.updated_at
            ? <> • Mis à jour le {new Date(theme.updated_at).toLocaleString()}</>
            : null}
        </div>
      </CardContent>
    </Card>
  );
}
