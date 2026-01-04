import * as React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ReferenceDot,
} from "recharts";

type Player = {
  id: number;
  name: string;
  colorHex?: string;
};

export type TimelinePoint = {
  x: string; // "0", "1", ... "B1", "B2", "B3"
  label: string;
  kind: "turn" | "bonus";
  [k: string]: any;
};

type JokerImpact = {
  turn_number: number;
  joker_name: string;
  using_player_id: number;
};

type Props = {
  players: Player[];
  data: TimelinePoint[];
  jokersImpacts?: JokerImpact[];
};

type CustomTickProps = {
  x?: number;
  y?: number;
  payload?: {
    value: string;
  };
};

function formatTickLabel(x: string, data: TimelinePoint[]) {
  const pt = data.find((d) => d.x === x);
  if (!pt) return x;

  // option: raccourcir un peu l’affichage sur l’axe
  if (pt.kind === "bonus") return pt.label.replace("Bonus — ", "");
  return pt.label.replace("Tour ", "");
}

function isNumericX(x: string) {
  return /^\d+$/.test(x);
}

export function ResultsScoreTimelineChart({ players, data, jokersImpacts }: Props) {
  // Index rapide: x -> TimelinePoint
  const byX = React.useMemo(() => {
    const m = new Map<string, TimelinePoint>();
    for (const d of data) m.set(d.x, d);
    return m;
  }, [data]);

  // Points à annoter (ReferenceDot)
  const jokerDots = React.useMemo(() => {
    const impacts = jokersImpacts ?? [];
    const out: Array<{
      key: string;
      x: string;
      y: number;
      jokerName: string;
      color?: string;
      // permet de décaler les labels si plusieurs jokers même joueur/même tour
      stackIndex: number;
    }> = [];

    // Compte occurrences par (turn, player) pour éviter superposition totale
    const stackCount = new Map<string, number>();

    for (const ji of impacts) {
      const x = String(ji.turn_number);
      if (!isNumericX(x)) continue;

      const pt = byX.get(x);
      if (!pt) continue;

      const y = pt[`p_${ji.using_player_id}`];
      if (typeof y !== "number") continue;

      const p = players.find((pp) => pp.id === ji.using_player_id);
      const color = p?.colorHex;

      const stackKey = `${x}:${ji.using_player_id}`;
      const prev = stackCount.get(stackKey) ?? 0;
      stackCount.set(stackKey, prev + 1);

      out.push({
        key: `joker-${ji.using_player_id}-${x}-${prev}-${ji.joker_name}`,
        x,
        y,
        jokerName: ji.joker_name,
        color,
        stackIndex: prev,
      });
    }

    return out;
  }, [jokersImpacts, byX, players]);

  const CustomXAxisTick = ({
    x = 0,
    y = 0,
    payload,
    }: CustomTickProps) => {
    const rawX = String(payload?.value ?? "");
    const pt = data.find((d) => d.x === rawX);

    const isBonus = pt?.kind === "bonus";
    const label = pt
        ? formatTickLabel(pt.x, data)
        : rawX;

    return (
        <g transform={`translate(${x},${y})`}>
        <text
            dy={16}
            textAnchor={isBonus ? "end" : "middle"}
            transform={isBonus ? "rotate(-45)" : undefined}
            fontSize={12}
        >
            {label}
        </text>
        </g>
    );
  };

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-base font-semibold">Évolution des scores</div>
      </div>

      <div className="h-[320px] sm:h-[360px] lg:h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 22, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
                dataKey="x"
                tickFormatter={(x: any) => formatTickLabel(String(x), data)}
                tick={<CustomXAxisTick />}
                height={60}
            />
            <YAxis allowDecimals={false} />

            <Tooltip
              formatter={(value: any, name?: string) => {
                const key = name ?? "";
                const pid = key.replace("p_", "");
                const p = players.find((pp) => String(pp.id) === pid);
                return [value, p?.name ?? name];
              }}
              labelFormatter={(label: any) => {
                const pt = data.find((d) => d.x === label);
                return pt?.label ?? label;
              }}
            />

            <Legend
              formatter={(value: any) => {
                const pid = String(value).replace("p_", "");
                const p = players.find((pp) => String(pp.id) === pid);
                return p?.name ?? value;
              }}
            />

            {/* ✅ Courbes */}
            {players.map((p) => (
              <Line
                key={p.id}
                type="monotone"
                dataKey={`p_${p.id}`}
                dot={false}
                stroke={p.colorHex}
                strokeWidth={3}
              />
            ))}

            {/* ✅ Jokers = points sur la courbe du joueur + label nom du joker */}
            {jokerDots.map((d) => (
              <ReferenceDot
                key={d.key}
                x={d.x}
                y={d.y}
                r={6}
                ifOverflow="extendDomain"
                fill={d.color ?? "currentColor"}
                stroke="rgba(0,0,0,0.35)"
                strokeWidth={1}
                label={{
                  value: d.jokerName,
                  position: "top",
                  // décale un peu si plusieurs jokers au même tour pour ce joueur
                  dy: -8 - d.stackIndex * 14,
                  fill: d.color ?? "currentColor",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
