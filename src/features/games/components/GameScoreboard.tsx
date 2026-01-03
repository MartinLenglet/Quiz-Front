import { cn } from "@/lib/utils";
import type { GameStateOut } from "@/features/games/schemas/games.schemas";

type Props = {
  state: GameStateOut;
  colorByPlayerId: Record<number, string | undefined>;

  targetingPlayer?: boolean;
  hoveredPlayerId?: number | null;
  onPlayerHover?: (playerId: number | null) => void;
  onPlayerClick?: (playerId: number) => void;

  interactionsDisabled?: boolean;
};

export function GameScoreboard({
  state,
  colorByPlayerId,
  targetingPlayer,
  hoveredPlayerId,
  onPlayerHover,
  onPlayerClick,
  interactionsDisabled,
}: Props) {
  const sorted = state.players.slice().sort((a, b) => a.order - b.order);

  const disabled = !!interactionsDisabled;

  const currentPlayerId = state.current_turn?.player.id ?? null;

  return (
    <div className={cn("rounded-lg border p-4", disabled ? "opacity-75" : null)}>
      <div className="mb-3 text-base font-semibold">Scores</div>

      <div className={cn("space-y-2", disabled ? "pointer-events-none" : null)}>
        {sorted.map((p) => {
          const points = state.scores[String(p.id)] ?? 0;
          const hex = colorByPlayerId[p.id];

          const isHovered = !!targetingPlayer && hoveredPlayerId === p.id;
          const clickable = !!targetingPlayer && !disabled;

          const isCurrentPlayer = p.id === currentPlayerId;

          return (
            <div
              key={p.id}
              role={clickable ? "button" : undefined}
              tabIndex={clickable ? 0 : -1}
              onMouseEnter={() => onPlayerHover?.(p.id)}
              onMouseLeave={() => onPlayerHover?.(null)}
              onClick={() => {
                if (!clickable) return;
                onPlayerClick?.(p.id);
              }}
              onKeyDown={(e) => {
                if (!clickable) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onPlayerClick?.(p.id);
                }
              }}
              className={cn(
                "flex items-center justify-between rounded-md border px-3 py-2 transition",
                clickable ? "cursor-pointer hover:brightness-105" : null,

                // 🔵 Joueur dont c’est le tour
                isCurrentPlayer ? "ring-2 ring-offset-2" : null,

                // 🎯 Hover lors du ciblage joker (plus léger)
                isHovered && !isCurrentPlayer ? "brightness-110" : null
              )}
              style={
                hex
                  ? {
                      borderColor: hex,

                      ...(isCurrentPlayer
                        ? {
                            // ring couleur joueur
                            ["--tw-ring-color" as any]: hex,

                            // background très léger (60% environ)
                            backgroundColor: `${hex}99`,
                          }
                        : null),
                    }
                  : undefined
              }
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full border"
                  style={hex ? { backgroundColor: hex, borderColor: hex } : undefined}
                />
                <div className="text-lg font-medium">{p.name}</div>
              </div>

              <div className="text-lg font-bold tabular-nums">{points}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
