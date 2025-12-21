import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import {
  useAnswerQuestionMutation,
  useColorsPublicQuery,
  useGameStateQuery,
  useUseJokerMutation,
} from "@/features/games/services/games.queries";
import type { GridCellOut } from "@/features/games/schemas/games.schemas";

import { GameTurnHeader } from "@/features/games/components/GameTurnHeader";
import { GameGrid } from "@/features/games/components/GameGrid";
import { GameScoreboard } from "@/features/games/components/GameScoreboard";

import { DisplayQuestionModal } from "@/features/questions/components/DisplayQuestionModal";

export default function GamePage() {
  const { gameUrl } = useParams<{ gameUrl: string }>();

  const stateQuery = useGameStateQuery(gameUrl);
  const colorsQuery = useColorsPublicQuery({ offset: 0, limit: 500 });

  const state = stateQuery.data;
  const colors = colorsQuery.data ?? [];

  const [selectedCell, setSelectedCell] = useState<GridCellOut | null>(null);

  const answerMutation = useAnswerQuestionMutation(gameUrl ?? "");
  const jokerMutation = useUseJokerMutation(gameUrl ?? "");

  const colorIdToHex = useMemo(() => {
    const m = new Map<number, string>();
    for (const c of colors) m.set(c.id, c.hex_code);
    return m;
  }, [colors]);

  const colorByPlayerId = useMemo(() => {
    const map: Record<number, string | undefined> = {};
    if (!state) return map;
    for (const p of state.players) map[p.id] = colorIdToHex.get(p.color_id);
    return map;
  }, [state, colorIdToHex]);

  const turnLabel = state?.current_turn ? `Tour de ${state.current_turn.player.name}` : "Tour —";

  if (stateQuery.isLoading || colorsQuery.isLoading) {
    return (
      <div className="p-6 sm:p-8 lg:p-12">
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Chargement…</CardContent>
        </Card>
      </div>
    );
  }

  if (stateQuery.isError || !state) {
    const err = stateQuery.error as any;

    return (
      <div className="p-6 sm:p-8 lg:p-12">
        <Card>
          <CardContent className="space-y-3 p-6">
            <div className="text-sm font-medium text-destructive">Impossible de charger la partie.</div>

            {"status" in (err ?? {}) ? (
              <div className="text-xs text-muted-foreground">
                <div>Status: {err.status}</div>
                <pre className="mt-2 max-h-64 overflow-auto rounded-md border p-3">
                  {JSON.stringify(err.body, null, 2)}
                </pre>
              </div>
            ) : null}

            {"issues" in (err ?? {}) ? (
              <div className="text-xs text-muted-foreground">
                <div>Zod parse error:</div>
                <pre className="mt-2 max-h-64 overflow-auto rounded-md border p-3">
                  {JSON.stringify(err.issues, null, 2)}
                </pre>
              </div>
            ) : null}

            {!("status" in (err ?? {})) && !("issues" in (err ?? {})) ? (
              <pre className="max-h-64 overflow-auto rounded-md border p-3 text-xs">
                {String(err?.message ?? err)}
              </pre>
            ) : null}
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentRoundId = state.current_turn?.round_id ?? null;

  async function handleUseJoker(jokerInGameId: number) {
    if (!gameUrl || !currentRoundId) return;

    await jokerMutation.mutateAsync({
      joker_in_game_id: jokerInGameId,
      round_id: currentRoundId,
    });
  }

  async function submitAnswer(args: { correct: boolean; skip: boolean }) {
    if (!gameUrl || !currentRoundId || !selectedCell) return;

    await answerMutation.mutateAsync({
      payload: {
        round_id: currentRoundId,
        grid_id: selectedCell.grid_id,
        correct_answer: args.correct,
        skip_answer: args.skip,
      },
      auto_next_round: true,
    });
  }

  return (
    // ✅ Layout “viewport-fit” :
    // - prend toute la hauteur écran
    // - la zone grille+scoreboard prend le reste
    // - la grille peut shrink (min-h-0) et calculer une taille de cases qui tient
    <div className="flex min-h-[100dvh] flex-col gap-6 p-6 sm:p-8 lg:p-12">
      {/* Header page (ne shrink pas) */}
      <div className="shrink-0 space-y-2">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Partie : {state.game.url}</h1>
          <div className="text-sm text-muted-foreground">
            Grille {state.game.rows_number}×{state.game.columns_number} ·{" "}
            {state.game.finished ? "Terminée" : "En cours"}
          </div>
        </div>

        <GameTurnHeader
          state={state}
          onUseJoker={handleUseJoker}
          disabled={jokersOrAnswersPending(jokerMutation.isPending, answerMutation.isPending)}
        />
      </div>

      {/* ✅ Zone principale = le reste de l’écran */}
      <div className="grid flex-1 min-h-0 gap-6 lg:grid-cols-[1fr_320px]">
  
        {/* Colonne grille : hauteur CONTRAINTE */}
        <div className="min-h-0 h-full flex">
          <div className="flex-1 min-h-0">
            <GameGrid
              state={state}
              colorByPlayerId={colorByPlayerId}
              onCellClick={(cell) => setSelectedCell(cell)}
            />
          </div>
        </div>

        {/* Scoreboard */}
        <div className="lg:self-stretch">
          <GameScoreboard state={state} colorByPlayerId={colorByPlayerId} />
        </div>
      </div>

      {/* Modale question */}
      <DisplayQuestionModal
        open={!!selectedCell}
        onOpenChange={(open) => !open && setSelectedCell(null)}
        themeTitle={selectedCell?.question.theme.name ?? "Thème"}
        points={selectedCell?.question.points ?? 0}
        turnLabel={turnLabel}
        questionText={selectedCell ? `Question #${selectedCell.question.id}` : ""}
        answerText={selectedCell ? `Réponse #${selectedCell.question.id}` : ""}
        autoCloseOnAction={true}
        onGoodAnswer={() => submitAnswer({ correct: true, skip: false })}
        onBadAnswer={() => submitAnswer({ correct: false, skip: false })}
        onCancelQuestion={() => submitAnswer({ correct: false, skip: true })}
      />

      {(answerMutation.isError || jokerMutation.isError) ? (
        <div className="text-sm text-destructive">
          {answerMutation.error instanceof Error ? answerMutation.error.message : null}
          {jokerMutation.error instanceof Error ? jokerMutation.error.message : null}
        </div>
      ) : null}
    </div>
  );
}

function jokersOrAnswersPending(jokerPending: boolean, answerPending: boolean) {
  return jokerPending || answerPending;
}
