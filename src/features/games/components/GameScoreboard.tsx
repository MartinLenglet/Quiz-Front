import type { GameStateOut } from "@/features/games/schemas/games.schemas";

type Props = {
  state: GameStateOut;
  colorByPlayerId: Record<number, string | undefined>;
};

export function GameScoreboard({ state, colorByPlayerId }: Props) {
  const sorted = state.players.slice().sort((a, b) => a.order - b.order);

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 text-base font-semibold">Scores</div>

      <div className="space-y-2">
        {sorted.map((p) => {
          const points = state.scores[String(p.id)] ?? 0;
          const hex = colorByPlayerId[p.id];

          return (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-md border px-3 py-2"
              style={hex ? { borderColor: hex } : undefined}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full border"
                  style={hex ? { backgroundColor: hex, borderColor: hex } : undefined}
                />
                <div className="font-medium">{p.name}</div>
              </div>

              <div className="text-lg font-bold tabular-nums">{points}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
