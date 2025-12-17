import * as React from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useUploadImageMutation } from "@/features/images/services/images.queries"
import { useCreateThemeMutation } from "../services/themes.queries";
import { ThemeCreateInSchema, type ThemeOut } from "../schemas/themes.schemas";
import type { ThemeCategory } from "@/features/themes/schemas/themes.schemas";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ThemeCategory[];
  defaults?: Partial<{
    ownerId: number;
    isPublic: boolean;
    isReady: boolean;
    validAdmin: boolean;
  }>;
  onCreated?: (theme: ThemeOut) => void;
};

const LocalFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),

  category_id: z
  .any()
  .refine((v) => v !== undefined && v !== null, { message: "La catégorie est requise" })
  .refine((v) => typeof v === "number" && Number.isInteger(v), { message: "La catégorie est requise" })
  .transform((v) => v as number),

  file: z.instanceof(File, { message: "Une image est requise" }),
});

export function CreateThemeModal({ open, onOpenChange, categories, defaults, onCreated }: Props) {
  const uploadMutation = useUploadImageMutation();
  const createMutation = useCreateThemeMutation();

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [categoryId, setCategoryId] = React.useState<number | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);

  const isBusy = uploadMutation.isPending || createMutation.isPending;

  function resetForm() {
    setName("");
    setDescription("");
    setCategoryId(null);
    setFile(null);
    setFormError(null);
    uploadMutation.reset();
    createMutation.reset();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const parsed = LocalFormSchema.safeParse({
      name,
      description,
      category_id: categoryId ?? undefined,
      file: file ?? undefined,
    });

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }

    try {
      // 1) upload image
      const uploaded = await uploadMutation.mutateAsync({ file: parsed.data.file });

      // 2) create theme
      const input = ThemeCreateInSchema.parse({
        name: parsed.data.name,
        description: parsed.data.description,
        image_id: uploaded.id,
        category_id: parsed.data.category_id,
        is_public: defaults?.isPublic ?? false,
        is_ready: defaults?.isReady ?? false,
        valid_admin: defaults?.validAdmin ?? false,
        owner_id: defaults?.ownerId ?? 0,
      });

      const theme = await createMutation.mutateAsync({ input });

      onCreated?.(theme);
      onOpenChange(false);
      resetForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) resetForm();
      }}
    >
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Créer un thème</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme-name">Nom</Label>
            <Input
              id="theme-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isBusy}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme-description">Description</Label>
            <Textarea
              id="theme-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isBusy}
            />
          </div>

          <div className="space-y-2">
            <Label>Catégorie</Label>
            <Select
              value={categoryId ? String(categoryId) : undefined}
              onValueChange={(v) => setCategoryId(Number(v))}
              disabled={isBusy}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme-image">Image</Label>
            <Input
              id="theme-image"
              type="file"
              accept="image/*"
              disabled={isBusy}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <p className="text-sm text-muted-foreground">
                Fichier sélectionné : <span className="font-medium">{file.name}</span>
              </p>
            ) : null}
          </div>

          {formError ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
              {formError}
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isBusy}>
              Annuler
            </Button>
            <Button type="submit" disabled={isBusy}>
              {isBusy ? "Création..." : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
