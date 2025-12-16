import * as React from "react";
import { usePublicThemes } from "@/features/themes/services/usePublicThemes";
import type { ThemeWithSignedUrlOut } from "@/features/themes/schemas/theme.schema";
import { NetflixSections, type CategorySection } from "@/features/themes/components/NetflixSections";
import type { RowItem } from "@/features/themes/components/CategoryRow";

// Grouping helper
function buildSections(themes: ThemeWithSignedUrlOut[]): CategorySection[] {
  // group by category_id (null -> 0)
  const map = new Map<number, ThemeWithSignedUrlOut[]>();

  for (const t of themes) {
    const catId = t.category_id ?? 0;
    const arr = map.get(catId);
    if (arr) arr.push(t);
    else map.set(catId, [t]);
  }

  // build sections sorted by category id (0 first)
  const sortedCategoryIds = Array.from(map.keys()).sort((a, b) => a - b);

  return sortedCategoryIds.map((categoryId) => {
    const items: RowItem[] = (map.get(categoryId) ?? []).map((t) => ({
      id: t.id,
      title: t.name,
      subtitle: t.description ?? null,
      imageUrl: t.image_signed_url ?? null,
      onClick: () => {
        // mets ton navigate ici si tu as react-router
        // navigate(`/themes/${t.id}`)
        console.log("click theme", t.id);
      },
    }));

    return {
      categoryId,
      title: categoryId === 0 ? "Sans catégorie" : `Catégorie #${categoryId}`,
      items,
    };
  });
}

export default function HomePage() {
  const { data, isLoading, error } = usePublicThemes({
    offset: 0,
    limit: 100,
    newest_first: true,
    ready_only: true,
    validated_only: false,
    with_signed_url: true, // pour afficher les images
  });

  const sections = React.useMemo(
    () => (data ? buildSections(data) : []),
    [data]
  );

  if (isLoading) return <div className="p-6">Chargement…</div>;
  if (error) return <div className="p-6">Erreur: {(error as Error).message}</div>;

  return (
    <div className="p-6">
      <NetflixSections sections={sections} />
    </div>
  );
}
