import { useMemo } from "react";
import { useParams } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import { useGameResultsQuery } from "@/features/games/services/games.queries";

import { ResultsScoreTimelineChart, type TimelinePoint } from "@/features/games/components/ResultsScoreTimelineChart";
import { ResultsLeaderboard } from "@/features/games/components/ResultsLeaderboard";
import { ResultsBonusTimeline } from "@/features/games/components/ResultsBonusTimeline";
import { ResultsBonusMetricsTable } from "@/features/games/components/ResultsBonusMetricsTable";
import { ResultsThemeRating } from "@/features/games/components/ResultsThemeRating";

export default function GameResultsPage() {
  const { gameUrl } = useParams<{ gameUrl: string }>();
  const resultsQuery = useGameResultsQuery(gameUrl);

  const r = resultsQuery.data;

  const players = useMemo(() => {
    if (!r) return [];
    return r.players
      .slice()
      .sort((a: any, b: any) => a.order - b.order)
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        order: p.order,
        colorHex: p.color?.hex_code,
      }));
  }, [r]);

  const chartData: TimelinePoint[] = useMemo(() => {
    if (!r) return [];

    // 0) baseline Tour 0
    const baseline: TimelinePoint = { x: "0", label: "Tour 0", kind: "turn" };
    for (const p of players) baseline[`p_${p.id}`] = 0;

    // 1) turns (scores cumulés)
    const turns: TimelinePoint[] = (r.turn_scores ?? []).map((t: any) => {
        const pt: TimelinePoint = {
        x: String(t.turn_number),
        label: `Tour ${t.turn_number}`,
        kind: "turn",
        };
        for (const p of players) pt[`p_${p.id}`] = t.scores?.[String(p.id)] ?? 0;
        return pt;
    });

    // point de départ pour les bonus = dernier tour (ou baseline si aucun tour)
    let prev: TimelinePoint = turns.at(-1) ?? baseline;

    // 2) bonus : 1 pseudo-tour par bonus, dans l’ordre renvoyé par l’API
    const bonusArr = r.bonus ?? [];
    const bonusSteps: TimelinePoint[] = bonusArr.map((b: any, idx: number) => {
        const x = `BONUS_${idx + 1}`; // stable et unique (axe)
        const label = b?.bonus?.name ? `Bonus — ${b.bonus.name}` : `Bonus ${idx + 1}`;

        const next: TimelinePoint = { x, label, kind: "bonus" };
        for (const p of players) {
        const prevScore = prev[`p_${p.id}`] ?? 0;
        const delta = b?.points_delta_by_player?.[String(p.id)] ?? 0;
        next[`p_${p.id}`] = prevScore + delta;
        }

        prev = next;
        return next;
    });

    // 3) sécurité : on force le tout dernier point = scores_with_bonus (si dispo)
    if (bonusSteps.length) {
        const last = bonusSteps[bonusSteps.length - 1];
        for (const p of players) {
        const final = r.scores_with_bonus?.[String(p.id)];
        if (typeof final === "number") last[`p_${p.id}`] = final;
        }
    }

    return [baseline, ...turns, ...bonusSteps];
    }, [r, players]);

  const themeOptions = useMemo(() => {
    if (!r) return [] as { id: number; name: string }[];

    const map = new Map<number, string>();
    for (const player of r.players) {
      if (!map.has(player.theme.id)) {
        map.set(player.theme.id, player.theme.name);
      }
    }

    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [r]);

  if (resultsQuery.isLoading) {
    return (
      <div className="p-6 sm:p-8 lg:p-12">
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Chargement…</CardContent>
        </Card>
      </div>
    );
  }

  if (resultsQuery.isError || !r) {
    return (
      <div className="p-6 sm:p-8 lg:p-12">
        <Card>
          <CardContent className="p-6 text-sm text-destructive">Impossible de charger les résultats.</CardContent>
        </Card>
      </div>
    );
  }

  // ✅ Layout :
  // - Desktop: chart à gauche, leaderboard à droite, puis bonus + meta + placeholder
  // - Mobile: chart, leaderboard, bonus, placeholder (puis meta si tu veux)
  return (
    <div className="flex min-h-[100dvh] flex-col gap-6 p-6 sm:p-8 lg:p-12">
      {/* MOBILE order */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <ResultsScoreTimelineChart
            players={players}
            data={chartData}
            jokersImpacts={r.jokers_impacts ?? []}
            />

          {/* Mobile: classement juste sous le graph */}
          <div className="block lg:hidden">
            <ResultsLeaderboard players={players} finalScores={r.scores_with_bonus ?? r.scores ?? {}} />
          </div>

          {/* Mobile: bonus ensuite */}
          <ResultsBonusTimeline
            players={players}
            bonus={r.bonus ?? []}
            />
          <ResultsBonusMetricsTable players={players} bonus={r.bonus ?? []} />

          {/* Commentaires sur les thèmes */}
          {r?.game?.id ? (
            <ResultsThemeRating gameId={r.game.id} themes={themeOptions} />
          ) : null}
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:flex-col lg:gap-6">
          <ResultsLeaderboard players={players} finalScores={r.scores_with_bonus ?? r.scores ?? {}} />
        </div>
      </div>
    </div>
  );
}