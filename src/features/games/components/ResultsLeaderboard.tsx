import { cn } from "@/lib/utils";

type Player = {
  id: number;
  name: string;
  order: number;
  colorHex?: string;
};

type Props = {
  players: Player[];
  finalScores: Record<string, number>; // scores_with_bonus
};

function isLightHex(hex?: string) {
  if (!hex) return false;
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.7;
}

export function ResultsLeaderboard({ players, finalScores }: Props) {
  const ranking = [...players]
    .map((p) => ({ p, score: finalScores[String(p.id)] ?? 0 }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 text-base font-semibold">Classement</div>

      <div className="space-y-2">
        {ranking.map(({ p, score }, idx) => {
          const bg = p.colorHex;
          const textColor = isLightHex(bg) ? "black" : "white";
          const isFirst = idx === 0;

          return (
            <div key={p.id} className="flex items-center justify-between rounded-md border px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="w-6 text-sm font-semibold tabular-nums text-muted-foreground">
                  #{idx + 1}
                </div>

                <div className="flex items-center gap-1">
                    <span
                        className={cn(
                        "inline-flex items-center rounded-full px-2 py-1 text-sm font-semibold"
                        )}
                        style={bg ? { backgroundColor: bg, color: textColor } : undefined}
                    >
                        {p.name}
                    </span>
                    {isFirst && <span className="text-lg leading-none">👑</span>}
                </div>
              </div>

              <div className="text-lg font-bold tabular-nums">{score}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
