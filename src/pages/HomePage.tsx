import * as React from "react";
import { usePublicThemes } from "@/features/themes/services/themes.queries";
import type { ThemeJoinWithSignedUrlOut } from "@/features/themes/schemas/themes.schemas";
import { NetflixSections, type CategorySection } from "@/features/themes/components/NetflixSections";
import { ThemePreviewModal } from "@/features/themes/components/ThemePreviewModal";
import type { RowItem } from "@/features/themes/components/CategoryRow";

function buildSections(themes: ThemeJoinWithSignedUrlOut[], onItemClick: (themeId: number) => void): CategorySection[] {
  const map = new Map<number, ThemeJoinWithSignedUrlOut[]>();

  for (const t of themes) {
    const catId = t.category_id ?? 0;
    const arr = map.get(catId);
    if (arr) arr.push(t);
    else map.set(catId, [t]);
  }

  const sortedCategoryIds = Array.from(map.keys()).sort((a, b) => a - b);

  return sortedCategoryIds.map((categoryId) => {
    const group = map.get(categoryId) ?? [];

    const categoryName =
      categoryId === 0
        ? "Sans catégorie"
        : group[0]?.category_name?.trim() || `Catégorie #${categoryId}`;

    const items: RowItem[] = group.map((t) => ({
      id: t.id,
      title: t.name,
      subtitle: t.description ?? null,
      imageUrl: t.image_signed_url ?? null,
      ownerName: t.owner_username ?? null,
      scoreAvg: t.score_avg,
      scoreCount: t.score_count,
      onClick: () => onItemClick(t.id),
    }));

    return {
      categoryId,
      title: categoryName,
      items,
    };
  });
}

export default function HomePage() {
  const { data, isLoading, error } = usePublicThemes({
    offset: 0,
    limit: 100,
    newest_first: true,
    with_signed_url: true, // pour afficher les images
  });

  const [selectedThemeId, setSelectedThemeId] = React.useState<number | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);

  const onItemClick = React.useCallback((themeId: number) => {
    setSelectedThemeId(themeId);
    setPreviewOpen(true);
  }, []);

  const sections = React.useMemo(
    () => (data ? buildSections(data, onItemClick) : []),
    [data, onItemClick]
  );

  if (isLoading) return <div className="p-6">Chargement…</div>;
  if (error) return <div className="p-6">Erreur: {(error as Error).message}</div>;

  return (
    <div className="p-6">
      <NetflixSections sections={sections} />

      <ThemePreviewModal
        themeId={selectedThemeId}
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setSelectedThemeId(null);
        }}
      />
    </div>
  );
}
