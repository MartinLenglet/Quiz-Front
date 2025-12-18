import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { UpdateThemeForm } from "@/features/themes/components/UpdateThemeForm";
import { useCategoriesQuery, useThemeByIdQuery } from "@/features/themes/services/themes.queries";

export default function UpdateThemePage() {
  const { themeId } = useParams();
  const numericThemeId = themeId ? Number(themeId) : null;

  const categoriesQuery = useCategoriesQuery();
  const themeQuery = useThemeByIdQuery(numericThemeId);

  const categories = categoriesQuery.data ?? [];
  const defaultQuestionsCount = useMemo(() => 9, []);

  return (
    <div className="space-y-6 py-6 pl-6 sm:pl-8 lg:pl-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Modifier le thème</h1>
        <p className="text-sm text-muted-foreground">
          Renseignez les questions & ajustez les informations du thème.
        </p>
      </div>

      <UpdateThemeForm
        themeId={numericThemeId}
        theme={themeQuery.data ?? null}
        themeLoading={themeQuery.isLoading}
        categories={categories}
        defaultQuestionsCount={defaultQuestionsCount}
        categoriesLoading={categoriesQuery.isLoading}
      />
    </div>
  );
}
