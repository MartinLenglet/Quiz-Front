import { useMemo, useState } from "react";
import { MyThemesList } from "@/features/themes/components/MyThemesList";
import { useMyThemesQuery } from "@/features/themes/services/themes.queries";
import { Button } from "@/components/ui/button";
import { CreateThemeModal } from "@/features/themes/components/CreateThemeModal";
import { useCategoriesQuery } from "@/features/themes/services/themes.queries";

export default function MyThemesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const params = useMemo(
    () => ({
      offset: 0,
      limit: 100,
      newest_first: true,
      with_signed_url: true,
    }),
    []
  );

  const myThemesQuery = useMyThemesQuery(params);
  const { data, isLoading, isError, error } = myThemesQuery;

  const categoriesQuery = useCategoriesQuery();
  const categories = categoriesQuery.data ?? [];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-6 py-6 pl-6 sm:pl-8 lg:pl-12">
        <h1 className="text-3xl font-semibold">Mes Thèmes</h1>

        <p className="text-sm text-muted-foreground">
            Retrouvez ici tous les thèmes que vous avez créés.
        </p>

        <Button
          onClick={() => setIsCreateOpen(true)}
          disabled={categoriesQuery.isLoading || categoriesQuery.isError}
        >
            Créer un thème
        </Button>
      </div>

      <CreateThemeModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        categories={categories}
        defaults={{
          ownerId: 0,
          isPublic: false,
          isReady: false,
          validAdmin: false,
        }}
        onCreated={() => {
          // orchestration UI: rafraîchir la liste après création
          myThemesQuery.refetch();
        }}
      />

      <MyThemesList
        themes={data}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error instanceof Error ? error.message : undefined}
      />
    </div>
  );
}
