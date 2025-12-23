import * as React from "react";
import { cn } from "@/lib/utils";
import { useElementSize } from "@/lib/useElementSize";
import type { GridCellOut, GameStateOut } from "@/features/games/schemas/games.schemas";

type Props = {
  state: GameStateOut;
  colorByPlayerId: Record<number, string | undefined>;
  onCellClick: (cell: GridCellOut) => void;

  targetingMode?: boolean;
  hoveredGridId?: number | null;
  onCellHover?: (cell: GridCellOut | null) => void;

  interactionsDisabled?: boolean;
};

function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function GameGrid({
  state,
  colorByPlayerId,
  onCellClick,
  targetingMode,
  hoveredGridId,
  onCellHover,
  interactionsDisabled,
}: Props) {
  const { rows_number: rows, columns_number: cols } = state.game;

  const { ref, size } = useElementSize<HTMLDivElement>();

  const gap = 8; // px

  const cellSize = React.useMemo(() => {
    const w = size.width;
    const h = size.height;
    if (!w || !h) return 0;

    const containerPadding = 16 * 2; // p-4
    const usableH = h - containerPadding - gap * (rows - 1);
    const usableW = w - containerPadding - gap * (cols - 1);

    const byW = usableW / cols;
    const byH = usableH / rows;

    const minPx = 36;
    return Math.max(minPx, Math.floor(Math.min(byW, byH)));
  }, [size.width, size.height, rows, cols]);

  const cellMap = new Map<string, GridCellOut>();
  for (const c of state.grid) cellMap.set(`${c.row}:${c.column}`, c);

  const themeToPlayerId = new Map<number, number>();
  for (const p of state.players) themeToPlayerId.set(p.theme_id, p.id);

  const gridDisabled = !!interactionsDisabled;

  return (
    <div ref={ref} className="h-full min-h-0">
      <div className="h-full rounded-lg border p-4">
        {cellSize === 0 ? (
          <div className="h-full w-full rounded-md bg-muted/20" />
        ) : (
          <div
            className={cn("grid gap-2", gridDisabled ? "pointer-events-none opacity-75" : null)}
            style={{
              gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
              gridAutoRows: `${cellSize}px`,
              justifyContent: "center",
              alignContent: "center",
            }}
          >
            {Array.from({ length: rows }).flatMap((_, row) =>
              Array.from({ length: cols }).map((__, col) => {
                const cell = cellMap.get(`${row}:${col}`);
                if (!cell) {
                  return <div key={`${row}-${col}`} className="rounded-md border bg-muted/30" />;
                }

                const ownerPlayerId = themeToPlayerId.get(cell.question.theme.id);
                const playerHex = ownerPlayerId ? colorByPlayerId[ownerPlayerId] : undefined;

                const isAnswered = cell.correct_answer || cell.skip_answer || !!cell.round_id;

                const bg = playerHex ? hexToRgba(playerHex, 0.22) : undefined;
                const border = playerHex ? hexToRgba(playerHex, 0.5) : undefined;

                const isHovered = !!targetingMode && hoveredGridId === cell.grid_id;

                return (
                  <button
                    key={`${row}-${col}`}
                    type="button"
                    onClick={() => onCellClick(cell)}
                    disabled={isAnswered}
                    onMouseEnter={() => onCellHover?.(cell)}
                    onMouseLeave={() => onCellHover?.(null)}
                    className={cn(
                      "h-full w-full rounded-md border p-2 text-left transition",
                      "hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50",
                      targetingMode ? "cursor-crosshair" : null,
                      isHovered ? "ring-2 ring-offset-2" : null
                    )}
                    style={{ background: bg, borderColor: border }}
                    title={cell.question.theme.name}
                  >
                    <div className="flex h-full flex-col justify-between">
                      <div className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">
                        {cell.question.theme.name}
                      </div>

                      <div className="flex items-end justify-between">
                        <div className="text-lg sm:text-2xl font-bold">{cell.question.points}</div>
                        {cell.correct_answer ? <div className="text-xs font-medium">✅</div> : null}
                        {cell.skip_answer ? <div className="text-xs font-medium">⏭️</div> : null}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
