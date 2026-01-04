import { cn } from "@/lib/utils";

type BonusEffect = {
  bonus_in_game_id: number;
  bonus: { id: number; name: string; description: string };
  points_delta_by_player: Record<string, number>;
};

type Player = { id: number; name: string; colorHex?: string };

type Props = {
  players: Player[];
  bonus: BonusEffect[];
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

export function ResultsBonusTimeline({ players, bonus }: Props) {
  if (!bonus?.length) {
    return (
      <div className="rounded-lg border p-4">
        <div className="text-base font-semibold">Bonus</div>
        <div className="mt-2 text-sm text-muted-foreground">Aucun bonus sur cette partie.</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 text-base font-semibold">Bonus & impacts</div>

      <div className="space-y-3">
        {bonus.map((b) => {
          // ✅ ordre spécifique à CE bonus : plus gros delta -> plus petit
          const playersByThisBonus = [...players].sort((pa, pb) => {
            const da = b.points_delta_by_player?.[String(pa.id)] ?? 0;
            const db = b.points_delta_by_player?.[String(pb.id)] ?? 0;
            return db - da;
          });

          return (
            <div key={b.bonus_in_game_id} className="rounded-md border p-3">
              <div className="font-semibold">{b.bonus.name}</div>
              <div className="mt-1 text-sm text-muted-foreground">{b.bonus.description}</div>

              <div className="mt-3 flex flex-wrap gap-2">
                {playersByThisBonus.map((p) => {
                  const d = b.points_delta_by_player?.[String(p.id)] ?? 0;

                  // si tu veux afficher aussi les 0, remplace par: (true) et style plus léger
                  if (d === 0) return null;

                  const label = d > 0 ? `+${d}` : `${d}`;

                  return (
                    <span
                      key={p.id}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold tabular-nums shadow-sm"
                      )}
                      style={
                        p.colorHex
                          ? {
                              backgroundColor: p.colorHex,
                              color: isLightHex(p.colorHex) ? "black" : "white",
                              opacity: 0.9,
                            }
                          : undefined
                      }
                      title={`${p.name} : ${label}`}
                    >
                      <span className="max-w-[120px] truncate">{p.name}</span>
                      <span className="opacity-95">{label}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
