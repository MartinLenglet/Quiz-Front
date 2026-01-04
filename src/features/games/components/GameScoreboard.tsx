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

  // ✅ delta du dernier tour (clé string -> number)
  const lastDeltaByPlayerId = state.last_round_delta?.delta ?? null;

  // ✅ Tour X/Y + dernier tour
  const x = state.current_full_turn_number ?? 0;
  const y = state.max_full_turns ?? 0;
  const isLastFullTurn = y > 0 && x >= y;

  return (
    <div className={cn("rounded-lg border p-4", disabled ? "opacity-75" : null)}>
      {/* HEADER */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-base font-semibold">Scores</div>

        <div className="flex items-center gap-2">
          <div className="text-xs font-medium text-muted-foreground tabular-nums">
            Tour {x}/{y}
          </div>

          {isLastFullTurn ? (
            <span className="rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide">
              DERNIER TOUR
            </span>
          ) : null}
        </div>
      </div>

      <div className={cn("space-y-2", disabled ? "pointer-events-none" : null)}>
        {sorted.map((p) => {
          const points = state.scores[String(p.id)] ?? 0;
          const hex = colorByPlayerId[p.id];

          const isHovered = !!targetingPlayer && hoveredPlayerId === p.id;
          const clickable = !!targetingPlayer && !disabled;

          const isCurrentPlayer = p.id === currentPlayerId;

          // ✅ delta du joueur (si présent)
          const rawDelta = lastDeltaByPlayerId ? lastDeltaByPlayerId[String(p.id)] : undefined;
          const delta = typeof rawDelta === "number" ? rawDelta : undefined;

          const deltaLabel = delta === undefined ? null : delta > 0 ? `+${delta}` : `${delta}`;

          const deltaClass =
            delta === undefined
              ? ""
              : delta > 0
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
              : delta < 0
              ? "bg-red-500/15 text-red-700 dark:text-red-300"
              : "bg-muted text-muted-foreground";

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
                isCurrentPlayer ? "ring-2 ring-offset-2" : null,
                isHovered && !isCurrentPlayer ? "brightness-110" : null
              )}
              style={
                hex
                  ? {
                      borderColor: hex,
                      ...(isCurrentPlayer
                        ? {
                            ["--tw-ring-color" as any]: hex,
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

              <div className="flex items-center gap-2">
                {/* ✅ delta */}
                {deltaLabel ? (
                  <span
                    className={cn("rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums", deltaClass)}
                    title={
                      state.last_round_delta
                        ? `Delta du tour ${state.last_round_delta.round_number}`
                        : "Delta dernier tour"
                    }
                  >
                    {deltaLabel}
                  </span>
                ) : null}

                <div className="text-lg font-bold tabular-nums">{points}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}