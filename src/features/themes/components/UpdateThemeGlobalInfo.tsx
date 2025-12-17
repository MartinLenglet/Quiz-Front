import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { ThemeCategory } from "@/features/themes/schemas/themes.schemas";

type Props = {
  name: string;
  description: string;
  categoryId: number | null;
  coverImage: File | null;
  isPublic: boolean;
  isReady: boolean;
  categories: ThemeCategory[];
  categoriesLoading: boolean;

  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onCategoryChange: (v: number) => void;
  onCoverImageChange: (f: File | null) => void;
  onIsPublicChange: (v: boolean) => void;
  onIsReadyChange: (v: boolean) => void;
};

export function UpdateThemeGlobalInfo({
  name,
  description,
  categoryId,
  coverImage,
  isPublic,
  isReady,
  categories,
  categoriesLoading,
  onNameChange,
  onDescriptionChange,
  onCategoryChange,
  onCoverImageChange,
  onIsPublicChange,
  onIsReadyChange,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations du thème</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Nom</Label>
          <Input value={name} onChange={(e) => onNameChange(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Catégorie</Label>
          <Select
            value={categoryId ? String(categoryId) : undefined}
            onValueChange={(v) => onCategoryChange(Number(v))}
            disabled={categoriesLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choisir une catégorie" />
            </SelectTrigger>
            <SelectContent className="w-[var(--radix-select-trigger-width)]">
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Image de couverture</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => onCoverImageChange(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            checked={isPublic}
            onCheckedChange={(v) => onIsPublicChange(Boolean(v))}
            id="is-public"
          />
          <Label htmlFor="is-public">Thème public</Label>
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            checked={isReady}
            onCheckedChange={(v) => onIsReadyChange(Boolean(v))}
            id="is-ready"
          />
          <Label htmlFor="is-ready">Thème prêt à jouer</Label>
        </div>
      </CardContent>
    </Card>
  );
}
