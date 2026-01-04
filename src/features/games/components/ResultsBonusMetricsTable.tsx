import * as React from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Player = {
  id: number;
  name: string;
  colorHex?: string;
};

type BonusRow = {
  bonus_in_game_id: number;
  bonus: { id: number; name: string; description: string };
  effect?: {
    key: string;
    metric_by_player?: Record<string, number>;
  } | null;
};

type Props = {
  players: Player[];
  bonus: BonusRow[];
  title?: string;
};

function isLightHex(hex?: string) {
  if (!hex) return false;
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.75;
}

function PlayerBadge({ p }: { p: Player }) {
  if (!p.colorHex) {
    return (
      <Badge variant="secondary" className="max-w-[140px] truncate">
        {p.name}
      </Badge>
    );
  }

  return (
    <Badge
      className="max-w-[140px] truncate"
      style={{
        backgroundColor: p.colorHex,
        color: isLightHex(p.colorHex) ? "black" : "white",
      }}
    >
      {p.name}
    </Badge>
  );
}

export function ResultsBonusMetricsTable({ players, bonus, title = "Métriques des bonus" }: Props) {
  const rows = React.useMemo(() => (bonus ?? []).filter(Boolean), [bonus]);

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-base font-semibold">{title}</div>
      </div>

      <div className="overflow-x-auto">
        <TooltipProvider>
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[260px]">Bonus</TableHead>

                {players.map((p) => (
                  <TableHead key={p.id} className="text-right">
                    <div className="flex justify-end">
                      <PlayerBadge p={p} />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={players.length + 1} className="text-sm text-muted-foreground">
                    Aucun bonus.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((b) => {
                  const metric = b.effect?.metric_by_player ?? {};
                  const hasEffect = !!b.effect;

                  return (
                    <TableRow key={b.bonus_in_game_id}>
                      <TableCell className="align-middle">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className={cn(
                                "text-left font-medium underline-offset-4 hover:underline",
                                !hasEffect ? "opacity-60" : null
                              )}
                            >
                              {b.bonus.name}
                            </button>
                          </TooltipTrigger>

                          <TooltipContent className="max-w-sm">
                            <div className="space-y-1">
                              <div className="font-medium">{b.bonus.name}</div>
                              <div className="text-sm">{b.bonus.description}</div>
                              {!hasEffect ? (
                                <div className="text-xs text-muted-foreground">
                                  Effet non disponible pour ce bonus.
                                </div>
                              ) : null}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>

                      {players.map((p) => {
                        const v = metric?.[String(p.id)];
                        return (
                          <TableCell key={p.id} className="text-right tabular-nums">
                            {typeof v === "number" ? v : "—"}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TooltipProvider>
      </div>
    </div>
  );
}
