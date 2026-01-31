import * as React from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LargeDialogContent } from "@/components/custom/large-dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Label,
} from "recharts";
import { useThemePreviewQuery } from "@/features/themes/services/themes.queries";

/** Mesure robuste d’un conteneur (évite les surprises de ResponsiveContainer en modale) */
function useResizeObserver<T extends HTMLElement>() {
  const [node, setNode] = React.useState<T | null>(null);
  const [rect, setRect] = React.useState({ width: 0, height: 0 });

  const ref = React.useCallback((el: T | null) => {
    setNode(el);
  }, []);

  React.useLayoutEffect(() => {
    if (!node) return;

    const update = () => {
      const r = node.getBoundingClientRect();
      setRect({ width: Math.floor(r.width), height: Math.floor(r.height) });
    };

    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(node);

    return () => ro.disconnect();
  }, [node]);

  return { ref, rect };
}

/** Format date to readable string (e.g., "23 Jan" or "il y a 2 jours") */
function formatCommentDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";

  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return "à l'instant";
      if (diffHours === 1) return "il y a 1 heure";
      return `il y a ${diffHours} heures`;
    }

    if (diffDays === 1) return "hier";
    if (diffDays < 7) return `il y a ${diffDays} jours`;

    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  } catch {
    return "—";
  }
}

export function ThemePreviewModal({
  themeId,
  open,
  onClose,
}: {
  themeId: number | null;
  open: boolean;
  onClose: () => void;
}) {
  const { data, isLoading, error } = useThemePreviewQuery(themeId);

  function textColorForHex(hex?: string) {
    if (!hex) return "#000";
    const h = hex.replace("#", "");
    const bigint = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "#000" : "#fff";
  }

  const chartData = React.useMemo(() => {
    if (!data?.question_stats)
      return [] as Array<{
        question_id: number;
        points: number;
        label: string;
        goodPercent: number;
        cancelledPercent: number;
        positive: number;
        negative: number;
        cancelled: number;
      }>;

    return data.question_stats
      .map((qs: any) => {
        const positive = qs.positive_answers_count ?? 0;
        const negative = qs.negative_answers_count ?? 0;
        const cancelled = qs.cancelled_answers_count ?? 0;
        const denom = positive + negative + cancelled;
        if (denom === 0) return null;

        const goodPercent = Math.round((positive / denom) * 100);
        const cancelledPercent = Math.round((cancelled / denom) * 100);
        const points = qs.points ?? 0;

        return {
          question_id: qs.question_id,
          points,
          label: `${points} pts`,
          goodPercent,
          cancelledPercent,
          positive,
          negative,
          cancelled,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.points - b.points);
  }, [data]);

  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const m = window.matchMedia("(max-width: 640px)");
    const onChange = (ev: MediaQueryListEvent | MediaQueryList) =>
      setIsMobile((ev as MediaQueryList).matches ?? (ev as MediaQueryListEvent).matches);

    setIsMobile(m.matches);

    if (m.addEventListener) m.addEventListener("change", onChange as any);
    else m.addListener(onChange as any);

    return () => {
      if (m.removeEventListener) m.removeEventListener("change", onChange as any);
      else m.removeListener(onChange as any);
    };
  }, []);

  const { ref: chartWrapRef, rect: chartRect } = useResizeObserver<HTMLDivElement>();

  const CHART_H = 360;
  const yAxisWidth = isMobile ? 110 : 140;
  const chartWidth = Math.max(0, chartRect.width);

  const categoryHex = data?.category_color_hex ?? undefined;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <LargeDialogContent className="!p-3 sm:!p-4">
        {/* Header : nom + catégorie + auteur */}
        <DialogHeader className="!gap-1 !space-y-0 py-0">
            <DialogTitle className="text-base leading-tight m-0">
                Preview du thème{" "}
                {data?.name ? (
                <span className="font-normal text-muted-foreground">— {data.name}</span>
                ) : null}
            </DialogTitle>

            <DialogDescription className="flex items-center gap-2 flex-wrap text-xs leading-tight m-0">
                {data?.category_name ? (
                <Badge
                    className="px-2 py-0.5 text-xs leading-none"
                    style={{
                    background: categoryHex,
                    color: textColorForHex(categoryHex),
                    }}
                >
                    {data.category_name}
                </Badge>
                ) : null}

                {data?.owner_username ? (
                <span className="text-muted-foreground">Par {data.owner_username}</span>
                ) : null}
            </DialogDescription>
        </DialogHeader>


        <div className="mt-1 min-w-0">
          <div className="overflow-y-auto overflow-x-hidden max-h-[64vh] pr-4 min-w-0">
            {isLoading ? (
              <div className="p-4">Chargement…</div>
            ) : error ? (
              <div className="p-4 text-destructive">Erreur: {(error as Error).message}</div>
            ) : data ? (
              <div className="space-y-4 min-w-0">
                {/* ✅ Nouveau bloc : cover à gauche, description à droite */}
                <div className="flex items-start gap-4 min-w-0">
                    <div className="w-44 h-28 sm:w-56 sm:h-36 bg-muted rounded overflow-hidden flex-shrink-0">
                        {data.image_signed_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={data.image_signed_url}
                            alt={data.name ?? "cover"}
                            className="w-full h-full object-cover"
                        />
                        ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                            Pas d'image
                        </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="text-sm text-muted-foreground">Description</div>
                        <div className="text-sm mt-1 break-words">
                        {data.description ?? "—"}
                        </div>
                    </div>
                </div>


                {/* Nombre de parties pleine largeur */}
                <div className="p-3 bg-muted rounded w-full">
                  <div className="text-sm text-muted-foreground">Nombre de parties</div>
                  <div className="font-medium">{data.plays_count ?? 0}</div>
                </div>

                {/* Stats par question */}
                <div className="min-w-0">
                  <div className="text-sm text-muted-foreground">Statistiques par question</div>

                  {chartData.length > 0 ? (
                    <div
                      ref={chartWrapRef}
                      className="mt-3 h-[360px] w-full min-w-0 overflow-hidden"
                    >
                      {chartWidth > 0 ? (
                        <div className="h-[360px] w-full min-w-0 overflow-hidden">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              width={chartWidth}
                              height={CHART_H}
                              layout="vertical"
                              data={chartData}
                              margin={{ top: 56, right: 12, bottom: 28, left: 56 }}
                            >
                              <defs>
                                <pattern
                                  id="hatch"
                                  patternUnits="userSpaceOnUse"
                                  width="6"
                                  height="6"
                                  patternTransform="rotate(45)"
                                >
                                  <rect width="6" height="6" fill="transparent" />
                                  <path d="M0,6 l6,-6" stroke="#9CA3AF" strokeWidth="2" />
                                </pattern>
                              </defs>

                              <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} />

                              <XAxis
                                type="number"
                                domain={[0, 100]}
                                ticks={[0, 25, 50, 75, 100]}
                                orientation="top"
                              >
                                <Label
                                  value="Pourcentage de bonnes réponses"
                                  position="top"
                                  offset={18}
                                />
                              </XAxis>

                              <YAxis 
                                type="category" 
                                dataKey="label" 
                                width={yAxisWidth}
                                interval={0}
                                tickMargin={6}
                              > 
                                <Label
                                  value="Question à X points"
                                  angle={-90}
                                  position="left"
                                  offset={0}
                                  style={{ textAnchor: "middle" }}
                                />
                              </YAxis>

                              <ReTooltip
                                formatter={(value: any, name?: string) => {
                                  if (name === "goodPercent")
                                    return [`${value}%`, "Bonnes réponses"];
                                  if (name === "cancelledPercent")
                                    return [`${value}%`, "Annulées"];
                                  return [value, name];
                                }}
                                labelFormatter={(label) => String(label)}
                              />

                              <Bar
                                dataKey="goodPercent"
                                stackId="a"
                                fill="#10B981"
                                isAnimationActive={false}
                              >
                                {chartData.map((_, idx) => (
                                  <Cell key={`cell-g-${idx}`} />
                                ))}
                              </Bar>

                              <Bar
                                dataKey="cancelledPercent"
                                stackId="a"
                                fill="url(#hatch)"
                                isAnimationActive={false}
                              >
                                {chartData.map((_, idx) => (
                                  <Cell key={`cell-c-${idx}`} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Aucune statistique disponible (questions ignorées ou non jouées)
                    </div>
                  )}
                </div>

                {/* Commentaires */}
                <Separator className="my-2" />

                <div className="min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-muted-foreground">Avis utilisateurs</div>
                    {data?.score_count && data.score_count > 0 ? (
                      <div className="text-sm font-medium">
                        {(data.score_avg ?? 0).toFixed(1)}/5⭐ ({data.score_count})
                      </div>
                    ) : null}
                  </div>

                  {data?.comments?.items && data.comments.items.length > 0 ? (
                    <ScrollArea className="h-64 w-full rounded-lg border bg-muted/30 p-3">
                      <div className="space-y-3">
                        {data.comments.items.map((comment: any) => (
                          <div key={comment.id} className="pb-3 border-b last:border-b-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span className="text-sm font-medium truncate">
                                  {comment.game_owner_username ?? "Anonyme"}
                                </span>
                                <span className="text-xs text-muted-foreground flex-shrink-0">
                                  {formatCommentDate(comment.created_at)}
                                </span>
                              </div>
                              <span className="text-sm font-medium flex-shrink-0">
                                {comment.score}/5⭐
                              </span>
                            </div>
                            {comment.comment && (
                              <p className="text-sm text-muted-foreground break-words">
                                {comment.comment}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="p-3 bg-muted/30 rounded-lg text-sm text-muted-foreground text-center">
                      Aucun commentaire
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4">Aucune donnée</div>
            )}
          </div>
        </div>
      </LargeDialogContent>
    </Dialog>
  );
}
