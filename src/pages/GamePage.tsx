import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useAnswerQuestionMutation,
  useColorsPublicQuery,
  useGameStateQuery,
  useUseJokerMutation,
} from "@/features/games/services/games.queries";
import { useQuestionByIdQuery } from "@/features/questions/services/questions.queries";
import type { GridCellOut, GameStateOut } from "@/features/games/schemas/games.schemas";

import { GameTurnHeader } from "@/features/games/components/GameTurnHeader";
import { GameGrid } from "@/features/games/components/GameGrid";
import { GameScoreboard } from "@/features/games/components/GameScoreboard";

import { DisplayQuestionModal } from "@/features/questions/components/DisplayQuestionModal";

type JokerAvailability = GameStateOut["available_jokers"][string][number];

type JokerTargetStep = "pickGrid" | "pickPlayer";

type JokerSelectionState =
  | { step: "idle" }
  | {
      step: JokerTargetStep;
      jokerInGameId: number;
      jokerId: number;
      jokerName: string;
      requiresGrid: boolean;
      requiresPlayer: boolean;
      targetGridId?: number;
      targetPlayerId?: number;
    };

function isSelectingJoker(s: JokerSelectionState): s is Exclude<JokerSelectionState, { step: "idle" }> {
  return s.step !== "idle";
}

function computeNextStep(s: Exclude<JokerSelectionState, { step: "idle" }>): JokerTargetStep | "done" {
  // Si les 2 true => d'abord case (grid), puis joueur
  if (s.requiresGrid && !s.targetGridId) return "pickGrid";
  if (s.requiresPlayer && !s.targetPlayerId) return "pickPlayer";
  return "done";
}

export default function GamePage() {
  const { gameUrl } = useParams<{ gameUrl: string }>();

  const stateQuery = useGameStateQuery(gameUrl);
  const colorsQuery = useColorsPublicQuery({ offset: 0, limit: 500 });

  const stateData = stateQuery.data;
  const colors = colorsQuery.data ?? [];

  const [selectedCell, setSelectedCell] = useState<GridCellOut | null>(null);
  const [jokerSel, setJokerSel] = useState<JokerSelectionState>({ step: "idle" });
  const [hoverGridId, setHoverGridId] = useState<number | null>(null);
  const [hoverPlayerId, setHoverPlayerId] = useState<number | null>(null);

  const jokerTargeting = isSelectingJoker(jokerSel);

  // Question query (ok même si undefined)
  const selectedQuestionId = selectedCell?.question.id;
  const questionQuery = useQuestionByIdQuery(selectedQuestionId, { with_signed_url: true });
  const q = questionQuery.data;

  const questionText = q?.question ?? (selectedCell ? "Chargement…" : "");
  const answerText = q?.answer ?? "";

  const questionMedia = q
    ? {
        imageUrl: q.question_image_signed_url ?? null,
        audioUrl: q.question_audio_signed_url ?? null,
        videoUrl: q.question_video_signed_url ?? null,
      }
    : undefined;

  const answerMedia = q
    ? {
        imageUrl: q.answer_image_signed_url ?? null,
        audioUrl: q.answer_audio_signed_url ?? null,
        videoUrl: q.answer_video_signed_url ?? null,
      }
    : undefined;

  const answerMutation = useAnswerQuestionMutation(gameUrl ?? "");
  const jokerMutation = useUseJokerMutation(gameUrl ?? "");

  // ✅ hooks toujours appelés, même si stateData est undefined
  const colorIdToHex = useMemo(() => {
    const m = new Map<number, string>();
    for (const c of colors) m.set(c.id, c.hex_code);
    return m;
  }, [colors]);

  const colorByPlayerId = useMemo(() => {
    const map: Record<number, string | undefined> = {};
    if (!stateData) return map;
    for (const p of stateData.players) map[p.id] = colorIdToHex.get(p.color_id);
    return map;
  }, [stateData, colorIdToHex]);

  const turnLabel = useMemo(() => {
    const turn = stateData?.current_turn;
    return turn ? `Tour de ${turn.player.name}` : "Tour —";
  }, [stateData]);

  const currentRoundId = stateData?.current_turn?.round_id ?? null;

  const jokerHint = useMemo(() => {
    if (!jokerTargeting) return null;

    if (jokerSel.step === "pickGrid") {
      return jokerSel.requiresPlayer
        ? `Joker "${jokerSel.jokerName}" : clique sur une case de la grille, puis sur un joueur.`
        : `Joker "${jokerSel.jokerName}" : clique sur une case de la grille.`;
    }

    if (jokerSel.step === "pickPlayer") {
      return `Joker "${jokerSel.jokerName}" : clique sur un joueur.`;
    }

    return null;
  }, [jokerTargeting, jokerSel]);

  // ✅ maintenant seulement : rendus conditionnels
  if (stateQuery.isLoading || colorsQuery.isLoading) {
    return (
      <div className="p-6 sm:p-8 lg:p-12">
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Chargement…</CardContent>
        </Card>
      </div>
    );
  }

  if (stateQuery.isError || !stateData) {
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

  // ✅ à partir d’ici state est garanti
  const state = stateData;

  function cancelJokerSelection() {
    setJokerSel({ step: "idle" });
    setHoverGridId(null);
    setHoverPlayerId(null);
  }

  async function submitJokerUse(sel: Exclude<JokerSelectionState, { step: "idle" }>) {
    if (!gameUrl || !currentRoundId) return;

    await jokerMutation.mutateAsync({
      joker_in_game_id: sel.jokerInGameId,
      round_id: currentRoundId,
      target_grid_id: sel.requiresGrid ? (sel.targetGridId ?? null) : null,
      target_player_id: sel.requiresPlayer ? (sel.targetPlayerId ?? null) : null,
    });

    cancelJokerSelection();
  }

  function handleSelectJoker(j: JokerAvailability) {
    if (!state.current_turn) return;
    if (!j.available) return;

    // re-clic sur le même joker => annule
    if (jokerTargeting && jokerSel.jokerInGameId === j.joker_in_game_id) {
      cancelJokerSelection();
      return;
    }

    // pendant targeting : autres jokers interdits
    if (jokerTargeting && jokerSel.jokerInGameId !== j.joker_in_game_id) {
      return;
    }

    const requiresGrid = !!j.joker.requires_target_grid;
    const requiresPlayer = !!j.joker.requires_target_player;

    // aucun target => post direct
    if (!requiresGrid && !requiresPlayer) {
      if (!gameUrl || !currentRoundId) return;
      void jokerMutation.mutateAsync({
        joker_in_game_id: j.joker_in_game_id,
        round_id: currentRoundId,
      });
      return;
    }

    const next: JokerTargetStep = requiresGrid ? "pickGrid" : "pickPlayer";

    setJokerSel({
      step: next,
      jokerInGameId: j.joker_in_game_id,
      jokerId: j.joker.id,
      jokerName: j.joker.name,
      requiresGrid,
      requiresPlayer,
      targetGridId: undefined,
      targetPlayerId: undefined,
    });

    // interdit les questions pendant ciblage
    setSelectedCell(null);
  }

  function handleTargetGrid(cell: GridCellOut) {
    if (!jokerTargeting) return;
    if (jokerSel.step !== "pickGrid") return;

    const updated: Exclude<JokerSelectionState, { step: "idle" }> = {
      ...jokerSel,
      targetGridId: cell.grid_id,
    };

    const next = computeNextStep(updated);
    if (next === "done") {
      void submitJokerUse(updated);
      return;
    }

    setJokerSel({ ...updated, step: next });
  }

  function handleTargetPlayer(playerId: number) {
    if (!jokerTargeting) return;
    if (jokerSel.step !== "pickPlayer") return;

    const updated: Exclude<JokerSelectionState, { step: "idle" }> = {
      ...jokerSel,
      targetPlayerId: playerId,
    };

    const next = computeNextStep(updated);
    if (next === "done") {
      void submitJokerUse(updated);
      return;
    }

    setJokerSel({ ...updated, step: next });
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
    <div className="flex min-h-[100dvh] flex-col gap-6 p-6 sm:p-8 lg:p-12">
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
          onSelectJoker={handleSelectJoker}
          disabled={jokersOrAnswersPending(jokerMutation.isPending, answerMutation.isPending)}
          targeting={jokerTargeting}
          selectedJokerInGameId={jokerTargeting ? jokerSel.jokerInGameId : null}
        />

        {jokerHint ? (
          <div className="rounded-lg border p-3 text-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>{jokerHint}</div>
              <Button type="button" variant="outline" onClick={cancelJokerSelection}>
                Annuler
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid flex-1 min-h-0 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-h-0 h-full flex">
          <div className="flex-1 min-h-0">
            <GameGrid
              state={state}
              colorByPlayerId={colorByPlayerId}
              targetingMode={jokerTargeting && jokerSel.step === "pickGrid"}
              hoveredGridId={hoverGridId}
              onCellHover={(cellOrNull) => setHoverGridId(cellOrNull?.grid_id ?? null)}
              interactionsDisabled={jokerTargeting && jokerSel.step === "pickPlayer"}
              onCellClick={(cell) => {
                if (jokerTargeting) {
                  if (jokerSel.step === "pickGrid") handleTargetGrid(cell);
                  return;
                }
                setSelectedCell(cell);
              }}
            />
          </div>
        </div>

        <div className="lg:self-stretch">
          <GameScoreboard
            state={state}
            colorByPlayerId={colorByPlayerId}
            targetingPlayer={jokerTargeting && jokerSel.step === "pickPlayer"}
            hoveredPlayerId={hoverPlayerId}
            onPlayerHover={(id) => setHoverPlayerId(id)}
            onPlayerClick={(id) => handleTargetPlayer(id)}
            interactionsDisabled={jokerTargeting && jokerSel.step === "pickGrid"}
          />
        </div>
      </div>

      <DisplayQuestionModal
        open={!!selectedCell && !jokerTargeting}
        onOpenChange={(open) => !open && setSelectedCell(null)}
        themeTitle={selectedCell?.question.theme.name ?? "Thème"}
        points={selectedCell?.question.points ?? 0}
        turnLabel={turnLabel}
        questionText={questionText}
        answerText={answerText}
        questionMedia={questionMedia}
        answerMedia={answerMedia}
        autoCloseOnAction={true}
        onGoodAnswer={() => submitAnswer({ correct: true, skip: false })}
        onBadAnswer={() => submitAnswer({ correct: false, skip: false })}
        onCancelQuestion={() => submitAnswer({ correct: false, skip: true })}
      />

      {answerMutation.isError || jokerMutation.isError ? (
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
