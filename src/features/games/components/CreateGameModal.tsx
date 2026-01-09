import * as React from "react";
import { useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import { ThemeCombobox } from "./ThemeCombobox";
import { MultiSelectCombobox } from "./MultiSelectCombobox";
import {
  useBonusQuery,
  useColorsPublicQuery,
  useCreateGameMutation,
  useJokersQuery,
  useSuggestSetupMutation,
} from "../services/games.queries";
import type { GameCreateOut } from "../schemas/games.schemas";

// 👉 à adapter selon ta feature themes existante
import { usePublicThemes } from "@/features/themes/services/themes.queries";

type PlayerDraft = {
  name: string;
  theme_id: number | null;
  color_id: number | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (game: GameCreateOut) => void;
};

function randomSeed() {
  // seed int “simple”
  return Math.floor(Date.now() % 2_000_000_000);
}

function ColorSwatch({
  hex,
  label,
}: {
  hex?: string | null;
  label?: string;
}) {
  return (
    <span
      aria-label={label}
      title={label}
      className="inline-block h-4 w-4 rounded-sm border"
      style={{ backgroundColor: hex ?? undefined }}
    />
  );
}

export function CreateGameModal({ open, onOpenChange, onCreated }: Props) {
  const [playersCount, setPlayersCount] = useState<number>(2);

  const [players, setPlayers] = useState<PlayerDraft[]>([
    { name: "Joueur 1", theme_id: null, color_id: null },
    { name: "Joueur 2", theme_id: null, color_id: null },
  ]);

  // champs “avancés”
  const [seed, setSeed] = useState<number>(randomSeed());
  const [rows, setRows] = useState<number>(5);
  const [cols, setCols] = useState<number>(5);
  const [questionsByPlayer, setQuestionsByPlayer] = useState<number>(5);

  const [generalThemeIds, setGeneralThemeIds] = useState<number[]>([]);
  const [jokerIds, setJokerIds] = useState<number[]>([]);
  const [bonusIds, setBonusIds] = useState<number[]>([]);

  const [withPawns, setWithPawns] = useState<boolean>(false);

  // Queries catalogues
  const colorsQuery = useColorsPublicQuery({ offset: 0, limit: 500 });
  const jokersQuery = useJokersQuery();
  const bonusQuery = useBonusQuery();

  // Thèmes (public)
  const publicThemesQuery = usePublicThemes({ offset: 0, limit: 200 });
  React.useEffect(() => { // Assure que la liste des thèmes publiques est à jour quand on crée une nouvelle partie
    if (open) {
      publicThemesQuery.refetch();
    }
  }, [open, publicThemesQuery]);

  const themes = publicThemesQuery.data ?? [];

  const colors = colorsQuery.data ?? [];
  const jokers = jokersQuery.data ?? [];
  const bonus = bonusQuery.data ?? [];

  const createMutation = useCreateGameMutation();
  const suggestMutation = useSuggestSetupMutation();

  const themesOptions = useMemo(
    () => themes.map((t: any) => ({ id: t.id, name: t.name })),
    [themes]
  );

  const colorsOptions = useMemo(
    () => colors.map((c: any) => ({ id: c.id, name: c.name, hex: c.hex_code })),
    [colors]
  );

  const generalThemesOptions = useMemo(
    () => themes.map((t: any) => ({ id: t.id, label: t.name })),
    [themes]
  );

  const jokersOptions = useMemo(
    () => jokers.map((j: any) => ({ id: j.id, label: j.name, description: j.description })),
    [jokers]
  );

  const bonusOptions = useMemo(
    () => bonus.map((b: any) => ({ id: b.id, label: b.name, description: b.description })),
    [bonus]
  );

  function getColorById(colorId: number | null) {
    return colorsOptions.find((c) => c.id === colorId);
  }

  // sync players array size when playersCount changes
  React.useEffect(() => {
    setPlayers((prev) => {
      const next = prev.slice(0, playersCount);
      while (next.length < playersCount) {
        next.push({
          name: `Joueur ${next.length + 1}`,
          theme_id: null,
          color_id: null,
        });
      }
      return next;
    });
  }, [playersCount]);

  const loadingCatalogs =
    colorsQuery.isLoading ||
    jokersQuery.isLoading ||
    bonusQuery.isLoading ||
    publicThemesQuery.isLoading;

  const disabled =
    loadingCatalogs ||
    colorsQuery.isError ||
    jokersQuery.isError ||
    bonusQuery.isError ||
    publicThemesQuery.isError;

  const selectedThemeIds = players
    .map((p) => p.theme_id)
    .filter((x): x is number => typeof x === "number");

  const hasDuplicateThemes =
    new Set(selectedThemeIds).size !== selectedThemeIds.length;

  const canSuggest = selectedThemeIds.length === players.length && !hasDuplicateThemes;

  const canCreate =
    !disabled &&
    players.every((p) => p.name.trim().length > 0 && p.theme_id && p.color_id) &&
    rows >= 1 &&
    cols >= 1 &&
    questionsByPlayer >= 1 &&
    generalThemeIds.length >= 1 &&
    !hasDuplicateThemes;

  function updatePlayer(index: number, patch: Partial<PlayerDraft>) {
    setPlayers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...patch } : p))
    );
  }

  async function handleSuggest() {
    if (!canSuggest) return;
    const payload = { players: players.map((p) => ({ theme_id: p.theme_id! })) };
    const res = await suggestMutation.mutateAsync(payload);
    setQuestionsByPlayer(res.number_of_questions_by_player);
    setRows(res.rows_number);
    setCols(res.columns_number);
    setGeneralThemeIds(res.general_theme_ids);
    setJokerIds(res.joker_ids);
    setBonusIds(res.bonus_ids);
    setWithPawns(false);
  }

  async function handleCreate() {
    if (!canCreate) return;

    const payload = {
      seed,
      rows_number: rows,
      columns_number: cols,
      players: players.map((p) => ({
        name: p.name,
        theme_id: p.theme_id!,
        color_id: p.color_id!,
      })),
      number_of_questions_by_player: questionsByPlayer,
      general_theme_ids: generalThemeIds,
      joker_ids: jokerIds.length ? jokerIds : null,
      bonus_ids: bonusIds.length ? bonusIds : null,
      with_pawns: withPawns,
    };

    const created = await createMutation.mutateAsync(payload);
    onCreated(created);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col p-0">
        {/* HEADER (fixe) */}
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Créer une partie</DialogTitle>
          <DialogDescription>
            Configure les joueurs, puis ajuste les réglages si besoin.
          </DialogDescription>
        </DialogHeader>

        {disabled ? (
          <div className="rounded-md border p-4 text-sm text-muted-foreground">
            Chargement des options… (ou erreur de chargement)
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Players count */}
            <div className="grid gap-2">
              <Label>Nombre de joueurs</Label>
              <Select
                value={String(playersCount)}
                onValueChange={(v) => setPlayersCount(Number(v))}
                disabled={disabled || createMutation.isPending}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Sélectionner…" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 9 }, (_, i) => i + 2).map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Players */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Joueurs</h3>
                {hasDuplicateThemes ? (
                  <span className="text-sm text-destructive">
                    Chaque joueur doit avoir un thème unique.
                  </span>
                ) : null}
              </div>

              <div className="space-y-4">
                {players.map((p, idx) => {
                  const selectedColor = getColorById(p.color_id);

                  return (
                    <div key={idx} className="space-y-3 rounded-lg border p-4">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>Nom</Label>
                          <Input
                            value={p.name}
                            onChange={(e) =>
                              updatePlayer(idx, { name: e.target.value })
                            }
                            disabled={createMutation.isPending}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Thème</Label>
                          <ThemeCombobox
                            valueId={p.theme_id}
                            onChange={(id) => updatePlayer(idx, { theme_id: id })}
                            options={themesOptions}
                            disabled={createMutation.isPending}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Couleur</Label>
                          <Select
                            value={p.color_id ? String(p.color_id) : ""}
                            onValueChange={(v) =>
                              updatePlayer(idx, { color_id: Number(v) })
                            }
                            disabled={createMutation.isPending}
                          >
                            <SelectTrigger className="w-full justify-between">
                              <SelectValue placeholder="Couleur…" asChild>
                                <div className="flex items-center gap-2">
                                  <ColorSwatch
                                    hex={selectedColor?.hex}
                                    label={
                                      selectedColor
                                        ? selectedColor.name
                                        : "Couleur non sélectionnée"
                                    }
                                  />
                                  <span className="text-sm">
                                    {selectedColor
                                      ? selectedColor.name
                                      : "Couleur…"}
                                  </span>
                                </div>
                              </SelectValue>
                            </SelectTrigger>

                            <SelectContent
                              position="popper"
                              sideOffset={8}
                              className="z-[100] max-h-[260px] overflow-y-auto"
                            >
                              {colorsOptions.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                  <div className="flex items-center gap-2">
                                    <ColorSwatch hex={c.hex} label={c.name} />
                                    <span>{c.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Suggest */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleSuggest}
                disabled={
                  !canSuggest ||
                  suggestMutation.isPending ||
                  createMutation.isPending
                }
              >
                Suggérer les réglages
              </Button>
              <p className="text-sm text-muted-foreground">
                Basé sur les thèmes des joueurs.
              </p>
            </div>

            {/* Advanced */}
            <Accordion type="single" collapsible>
              <AccordionItem value="advanced">
                <AccordionTrigger>Réglages avancés</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6 pt-2">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Questions / joueur</Label>
                        <Input
                          type="number"
                          value={questionsByPlayer}
                          min={1}
                          max={50}
                          onChange={(e) =>
                            setQuestionsByPlayer(Number(e.target.value))
                          }
                          disabled={createMutation.isPending}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Lignes</Label>
                        <Input
                          type="number"
                          value={rows}
                          min={1}
                          max={50}
                          onChange={(e) => setRows(Number(e.target.value))}
                          disabled={createMutation.isPending}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Colonnes</Label>
                        <Input
                          type="number"
                          value={cols}
                          min={1}
                          max={50}
                          onChange={(e) => setCols(Number(e.target.value))}
                          disabled={createMutation.isPending}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Thèmes de culture générale</Label>
                      <MultiSelectCombobox
                        values={generalThemeIds}
                        onChange={setGeneralThemeIds}
                        options={generalThemesOptions}
                        placeholder="Choisir au moins un thème…"
                        disabled={createMutation.isPending}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Jokers</Label>
                        <MultiSelectCombobox
                          values={jokerIds}
                          onChange={setJokerIds}
                          options={jokersOptions}
                          placeholder="Ajouter des jokers…"
                          disabled={createMutation.isPending}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Bonus</Label>
                        <MultiSelectCombobox
                          values={bonusIds}
                          onChange={setBonusIds}
                          options={bonusOptions}
                          placeholder="Ajouter des bonus…"
                          disabled={createMutation.isPending}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Mode de jeu</Label>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="with-pawns"
                          checked={withPawns}
                          onCheckedChange={(checked) => setWithPawns(checked === true)}
                          disabled={createMutation.isPending}
                        />
                        <Label htmlFor="with-pawns" className="cursor-pointer font-normal">
                          Avec des pions
                        </Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Seed</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={seed}
                          onChange={(e) => setSeed(Number(e.target.value))}
                          disabled={createMutation.isPending}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setSeed(randomSeed())}
                        >
                          Aléatoire
                        </Button>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Rappel : il faut au moins 1 thème “culture générale”.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* FOOTER (fixe) */}
          <DialogFooter className="border-t px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Annuler
            </Button>

            <Button
              type="button"
              onClick={handleCreate}
              disabled={!canCreate || createMutation.isPending}
            >
              {createMutation.isPending ? "Création…" : "Créer la partie"}
            </Button>

            {createMutation.isError ? (
              <div className="text-sm text-destructive">
                Erreur:{" "}
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : "Impossible de créer"}
              </div>
            ) : null}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
