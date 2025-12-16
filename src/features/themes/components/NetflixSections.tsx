import { CategoryRow, type RowItem } from "./CategoryRow";

export type CategorySection = {
  categoryId: number;     // group key
  title: string;          // pour l’instant "Catégorie #X"
  items: RowItem[];
};

export function NetflixSections({ sections }: { sections: CategorySection[] }) {
  return (
    <div className="space-y-10">
      {sections.map((s) => (
        <CategoryRow key={s.categoryId} title={s.title} items={s.items} />
      ))}
    </div>
  );
}
