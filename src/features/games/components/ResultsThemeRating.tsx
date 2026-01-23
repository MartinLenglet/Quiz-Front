import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useMeQuery } from "@/features/auth/services/auth.queries";
import { useCreateThemeCommentMutation, useDeleteThemeCommentMutation, useUpdateThemeCommentMutation } from "@/features/comments/services/comments.queries";
import { useThemePreviewQuery } from "@/features/themes/services/themes.queries";

type ThemeOption = { id: number; name: string };

function StarSelector({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (next: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Note du thème">
      {Array.from({ length: 5 }).map((_, idx) => {
        const starValue = idx + 1;
        const isActive = value >= starValue;
        return (
          <button
            key={starValue}
            type="button"
            disabled={disabled}
            className={`h-8 w-8 rounded border text-lg leading-none transition-colors ${
              isActive
                ? "border-yellow-500 text-yellow-500 bg-yellow-500/10"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => onChange(isActive && value === starValue ? 0 : starValue)}
            aria-pressed={isActive}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

export function ResultsThemeRating({
  gameId,
  themes,
}: {
  gameId: number;
  themes: ThemeOption[];
}) {
  const [selectedThemeId, setSelectedThemeId] = useState<number | null>(themes[0]?.id ?? null);
  const [commentValue, setCommentValue] = useState("");
  const [scoreValue, setScoreValue] = useState(0);

  const meQuery = useMeQuery(true);
  const userId = meQuery.data?.id ?? null;

  const previewQuery = useThemePreviewQuery(selectedThemeId, {
    comments_offset: 0,
    comments_limit: 50,
  });

  const myComment = useMemo(() => {
    if (!previewQuery.data || !userId || !selectedThemeId) return null;
    return (
      previewQuery.data.comments?.items?.find(
        (c) => c.game_owner_id === userId && c.theme_id === selectedThemeId && c.game_id === gameId
      ) ?? null
    );
  }, [gameId, previewQuery.data, selectedThemeId, userId]);

  useEffect(() => {
    if (myComment) {
      setScoreValue(myComment.score ?? 0);
      setCommentValue(myComment.comment ?? "");
    } else {
      setScoreValue(0);
      setCommentValue("");
    }
  }, [myComment]);

  const createMutation = useCreateThemeCommentMutation(selectedThemeId ?? 0);
  const updateMutation = useUpdateThemeCommentMutation(selectedThemeId ?? 0, myComment?.id ?? 0);
  const deleteMutation = useDeleteThemeCommentMutation(selectedThemeId ?? 0, myComment?.id ?? 0);

  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const canSubmit = Boolean(userId && selectedThemeId && scoreValue >= 0 && scoreValue <= 5);

  async function handleSubmit() {
    if (!selectedThemeId || !canSubmit) return;

    const payload = {
      game_id: gameId,
      theme_id: selectedThemeId,
      score: scoreValue,
      comment: commentValue || null,
    };

    if (myComment) {
      await updateMutation.mutateAsync({ payload });
    } else {
      await createMutation.mutateAsync({ payload });
    }
  }

  async function handleDelete() {
    if (!myComment || !selectedThemeId) return;
    await deleteMutation.mutateAsync();
  }

  if (!themes.length) {
    return null;
  }

  const selectedTheme = themes.find((t) => t.id === selectedThemeId);

  return (
    <div className="rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-base font-semibold">Noter les thèmes</div>
          {selectedTheme ? (
            <div className="text-sm text-muted-foreground">Thème sélectionné: {selectedTheme.name}</div>
          ) : null}
        </div>

        {themes.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            {themes.map((t) => (
              <Button
                key={t.id}
                variant={t.id === selectedThemeId ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedThemeId(t.id)}
              >
                {t.name}
              </Button>
            ))}
          </div>
        ) : null}
      </div>

      <Separator className="my-3" />

      <div className="min-h-[380px]">
        {previewQuery.isLoading ? (
          <div className="text-sm text-muted-foreground">Chargement des commentaires…</div>
        ) : previewQuery.isError ? (
          <div className="text-sm text-destructive">Impossible de charger les commentaires.</div>
        ) : previewQuery.data ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Commentaires</span>
              {typeof previewQuery.data.score_count === "number" && previewQuery.data.score_count > 0 ? (
                <span className="text-muted-foreground">
                  {previewQuery.data.score_avg.toFixed(1)}/5 ⭐ ({previewQuery.data.score_count})
                </span>
              ) : null}
            </div>

            {previewQuery.data.comments?.items?.length ? (
              <ScrollArea className="h-48 w-full rounded border bg-muted/30 p-3">
                <div className="space-y-3">
                  {previewQuery.data.comments.items.map((c) => (
                    <div key={c.id} className="border-b pb-2 last:border-b-0">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{c.game_owner_username ?? "Anonyme"}</span>
                        <span className="text-muted-foreground">{c.score}/5 ⭐</span>
                      </div>
                      {c.comment ? (
                        <p className="text-sm text-muted-foreground break-words">{c.comment}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-sm text-muted-foreground">Aucun commentaire pour ce thème.</div>
            )}

            <Separator className="my-2" />

            {!userId ? (
              <div className="text-sm text-muted-foreground">
                Connectez-vous pour laisser un avis sur ce thème.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">Votre note</div>
                  <StarSelector
                    value={scoreValue}
                    onChange={setScoreValue}
                    disabled={isMutating || !selectedThemeId}
                  />
                </div>

                <Textarea
                  value={commentValue}
                  onChange={(e) => setCommentValue(e.target.value)}
                  placeholder="Commentaire (facultatif)"
                  disabled={isMutating || !selectedThemeId}
                  rows={3}
                />

                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-muted-foreground">
                    Cliquez sur l’étoile sélectionnée pour remettre la note à 0.
                  </div>

                  <div className="flex items-center gap-2">
                    {myComment ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={isMutating}
                      >
                        Supprimer
                      </Button>
                    ) : null}

                    <Button
                      size="sm"
                      onClick={handleSubmit}
                      disabled={!canSubmit || isMutating || !selectedThemeId}
                    >
                      {myComment ? "Mettre à jour" : "Publier"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
