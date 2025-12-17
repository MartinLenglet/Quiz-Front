import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { z } from "zod";
import type { ThemeWithSignedUrlOutSchema } from "../schemas/themes.schemas";
import { MyThemeCard } from "./MyThemeCard";

type Theme = z.infer<typeof ThemeWithSignedUrlOutSchema>;

type Props = {
  themes: Theme[] | undefined;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onEditTheme?: (themeId: number) => void;
};

export function MyThemesList({ themes, isLoading, isError, errorMessage, onEditTheme }: Props) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Impossible de charger vos thèmes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {errorMessage ?? "Une erreur est survenue. Veuillez réessayer."}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!themes || themes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aucun thème</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Vous n’avez pas encore créé de thème.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {themes.map((t) => (
        <MyThemeCard key={t.id} theme={t} onEdit={onEditTheme} />
      ))}
    </div>
  );
}
