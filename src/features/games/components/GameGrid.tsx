import * as React from "react";
import { cn } from "@/lib/utils";
import { useElementSize } from "@/lib/useElementSize";
import type { GridCellOut, GameStateOut, GameStatePlayer } from "@/features/games/schemas/games.schemas";

type Props = {
  state: GameStateOut;
  colorByPlayerId: Record<number, string | undefined>;
  onCellClick: (cell: GridCellOut) => void;

  targetingMode?: boolean;
  hoveredGridId?: number | null;
  onCellHover?: (cell: GridCellOut | null) => void;

  interactionsDisabled?: boolean;
};

function isEdgeCell(row: number, col: number, rows: number, cols: number): boolean {
  return row === 0 || row === rows - 1 || col === 0 || col === cols - 1;
}

function getValidPawnMoves(
  player: GameStatePlayer,
  rows: number,
  cols: number,
  answeredCells: Set<string>,
  otherPawnPositions: Set<string>
): Set<string> {
  const valid = new Set<string>();
  const pawnRow = player.pawn_row;
  const pawnCol = player.pawn_col;

  if (pawnRow === null || pawnCol === null) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (isEdgeCell(r, c, rows, cols)) {
          const key = `${r}:${c}`;
          if (!answeredCells.has(key) && !otherPawnPositions.has(key)) {
            valid.add(key);
          }
        }
      }
    }
  } else {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],          [0, 1],
      [1, -1],  [1, 0], [1, 1],
    ];
    for (const [dr, dc] of directions) {
      let nr = pawnRow + dr;
      let nc = pawnCol + dc;
      while (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        const key = `${nr}:${nc}`;
        if (otherPawnPositions.has(key)) {
          break;
        }
        if (!answeredCells.has(key)) {
          valid.add(key);
          break;
        }
        nr += dr;
        nc += dc;
      }
    }
  }

  return valid;
}

function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function hexToShadow(hex: string, alpha: number) {
  return `0 6px 14px ${hexToRgba(hex, alpha)}`;
}

// ✅ détecte si une couleur est "claire" (=> texte noir), sinon texte blanc
function isLightHex(hex?: string) {
  if (!hex) return false;
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;

  // relative luminance
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.3; // seuil "presque blanc"
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

    const containerPadding = 16 * 2;
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

  const playerNameById = React.useMemo(() => {
    const m = new Map<number, string>();
    for (const p of state.players) m.set(p.id, p.name);
    return m;
  }, [state.players]);

  const withPawns = state.game.with_pawns;
  const currentPlayerId = state.current_turn?.player.id ?? null;

  const pawnPositionsByCell = React.useMemo(() => {
    const m = new Map<string, GameStatePlayer[]>();
    if (!withPawns) return m;
    for (const p of state.players) {
      if (p.pawn_row !== null && p.pawn_col !== null) {
        const key = `${p.pawn_row}:${p.pawn_col}`;
        const arr = m.get(key) ?? [];
        arr.push(p);
        m.set(key, arr);
      }
    }
    return m;
  }, [state.players, withPawns]);

  const validMoves = React.useMemo(() => {
    if (!withPawns || !currentPlayerId) return new Set<string>();

    const currentPlayer = state.players.find((p) => p.id === currentPlayerId);
    if (!currentPlayer) return new Set<string>();

    const answeredCells = new Set<string>();
    for (const cell of state.grid) {
      if (cell.round_id !== null) {
        answeredCells.add(`${cell.row}:${cell.column}`);
      }
    }

    const otherPawnPositions = new Set<string>();
    for (const p of state.players) {
      if (p.id !== currentPlayerId && p.pawn_row !== null && p.pawn_col !== null) {
        otherPawnPositions.add(`${p.pawn_row}:${p.pawn_col}`);
      }
    }

    return getValidPawnMoves(currentPlayer, rows, cols, answeredCells, otherPawnPositions);
  }, [withPawns, currentPlayerId, state.players, state.grid, rows, cols]);

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

                // couleur "de la case" (thème owner)
                const ownerPlayerId = themeToPlayerId.get(cell.question.theme.id);
                const ownerHex = ownerPlayerId ? colorByPlayerId[ownerPlayerId] : undefined;

                // ✅ joueur qui a répondu (pour badge)
                const answeredById = cell.player_id ?? null;
                const answeredByHex = answeredById ? colorByPlayerId[answeredById] : undefined;
                const answeredByName = answeredById ? playerNameById.get(answeredById) : undefined;

                const isAnswered = cell.correct_answer || cell.skip_answer || !!cell.round_id;

                // ✅ fond plus opaque si non répondu (60%)
                const bgAlpha = isAnswered ? 0.22 : 0.6;
                const bg = ownerHex ? hexToRgba(ownerHex, bgAlpha) : undefined;
                const border = ownerHex ? hexToRgba(ownerHex, 0.55) : undefined;
                const baseShadow = ownerHex
                  ? hexToShadow(ownerHex, isAnswered ? 0.18 : 0.28)
                  : "0 4px 10px rgba(0,0,0,0.15)";

                const hoverShadow = ownerHex
                  ? hexToShadow(ownerHex, 0.45)
                  : "0 8px 20px rgba(0,0,0,0.25)";

                const isHovered = !!targetingMode && hoveredGridId === cell.grid_id;

                // ✅ texte blanc sauf si le fond (couleur) est très clair
                const forceWhite = !!ownerHex && !isLightHex(ownerHex);
                const forceBlack = !!ownerHex && isLightHex(ownerHex);
                const textColorClass = forceWhite ? "text-white" : forceBlack ? "text-black" : "text-foreground";
                const textMutedClass = forceWhite ? "text-white/90" : forceBlack ? "text-black/80" : "text-muted-foreground";

                const hasBeenAnswered = !!cell.player_id || !!cell.round_id;

                const statusIcon = cell.skip_answer
                  ? "⏭️"
                  : cell.correct_answer
                  ? "✅"
                  : hasBeenAnswered
                  ? "❌"
                  : null;

                const cellKey = `${row}:${col}`;
                const pawnsOnCell = pawnPositionsByCell.get(cellKey) ?? [];
                const isValidMove = withPawns ? validMoves.has(cellKey) : true;
                const isPawnModeDisabled = withPawns && !isValidMove && !isAnswered;

                return (
                  <div
                    key={`${row}-${col}`}
                    className="relative h-full w-full overflow-hidden rounded-md"
                  >
                    {/* ✅ Pawn indicators */}
                    {withPawns && pawnsOnCell.length > 0 ? (
                      <div className="pointer-events-none absolute left-1 top-1 z-30 flex gap-0.5">
                        {pawnsOnCell.map((p) => {
                          const pawnHex = colorByPlayerId[p.id];
                          return (
                            <div
                              key={p.id}
                              className="h-4 w-4 rounded-full border-2 border-white shadow-md"
                              style={{ backgroundColor: pawnHex ?? "#888" }}
                              title={p.name}
                            />
                          );
                        })}
                      </div>
                    ) : null}

                    {/* ✅ Bandeau coin supérieur droit (clippé dans la case) */}
                    {answeredById && answeredByName && statusIcon ? (
                      <div className="pointer-events-none absolute right-0 top-0 z-20">
                        <div
                          className={cn(
                            "absolute",
                            // position “ruban” : on le décale vers la droite, mais il reste clippé
                            "right-[-44px] top-[12px]",
                            "w-[140px] rotate-45",
                            "px-2 py-1",
                            "text-[11px] font-semibold leading-none",
                            "shadow-md"
                          )}
                          style={
                            answeredByHex
                              ? {
                                  backgroundColor: hexToRgba(answeredByHex, 0.6),
                                  color: isLightHex(answeredByHex) ? "black" : "white",
                                }
                              : undefined
                          }
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span className="max-w-[96px] truncate">{answeredByName}</span>
                            <span>{statusIcon}</span>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {/* ✅ Le bouton prend toute la place du wrapper */}
                    <button
                      type="button"
                      onClick={() => onCellClick(cell)}
                      disabled={isAnswered || isPawnModeDisabled}
                      onMouseEnter={() => onCellHover?.(cell)}
                      onMouseLeave={() => onCellHover?.(null)}
                      className={cn(
                        "relative h-full w-full rounded-md border p-2 text-left transition-all duration-200",
                        "hover:brightness-105 hover:scale-125",
                        "shadow-sm hover:shadow-md",
                        "disabled:cursor-not-allowed disabled:opacity-20 disabled:shadow-none disabled:hover:scale-100",
                        targetingMode ? "cursor-crosshair" : null,
                        isHovered ? "ring-2 ring-offset-2 shadow-lg" : null,
                        withPawns && isValidMove && !isAnswered ? "ring-2 ring-green-500/50" : null
                      )}
                      style={{
                        background: bg,
                        borderColor: border,
                        boxShadow: isHovered ? hoverShadow : baseShadow,
                      }}
                      title={cell.question.theme.name}
                    >
                      <div className="flex h-full flex-col items-center justify-center gap-1">
                        <div className={cn("text-[10px] sm:text-xs line-clamp-2 text-center", textMutedClass)}>
                          {cell.question.theme.name}
                        </div>
                        <div className={cn("text-lg sm:text-2xl font-bold", textColorClass)}>
                          {cell.question.points}
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}