import { useMemo } from "react";
import { MyThemesList } from "@/features/themes/components/MyThemesList";
import { useMyThemesQuery } from "@/features/themes/services/themes.queries";
import { Button } from "@/components/ui/button";

export default function MyThemesPage() {
  const params = useMemo(
    () => ({
      offset: 0,
      limit: 100,
      newest_first: true,
      with_signed_url: true,
    }),
    []
  );

  const { data, isLoading, isError, error } = useMyThemesQuery(params);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-6 py-6 pl-6 sm:pl-8 lg:pl-12">
        <h1 className="text-3xl font-semibold">Mes Thèmes</h1>

        <p className="text-sm text-muted-foreground">
            Retrouvez ici tous les thèmes que vous avez créés.
        </p>

        <Button>
            Créer un thème
        </Button>
    </div>

      <MyThemesList
        themes={data}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error instanceof Error ? error.message : undefined}
      />
    </div>
  );
}
