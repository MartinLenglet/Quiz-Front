import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export type RowItem = {
  id: string | number;
  title: string;
  imageUrl?: string | null;
  subtitle?: string | null;
  ownerName?: string | null;
  onClick?: () => void;
};

export function CategoryRow({ title, items }: { title: string; items: RowItem[] }) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>

      <ScrollArea className="w-full">
        <div
          ref={viewportRef}
          className="flex gap-4 overflow-x-auto pb-4 pr-2 snap-x snap-mandatory"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {items.map((item) => (
            <Card
              key={item.id}
              className="
                cursor-pointer overflow-hidden
                min-w-[clamp(180px,60vw,240px)] max-w-[clamp(180px,60vw,240px)]
                sm:min-w-[240px] sm:max-w-[240px]
                md:min-w-[260px] md:max-w-[260px]
                h-[270px] sm:h-[290px]
                flex flex-col
                snap-start
              "
              style={{ scrollSnapAlign: "start" }}
              onClick={item.onClick}
              role={item.onClick ? "button" : undefined}
              tabIndex={item.onClick ? 0 : undefined}
              onKeyDown={(e) => {
                if (!item.onClick) return;
                if (e.key === "Enter" || e.key === " ") item.onClick();
              }}
            >
              {/* Zone image FIXE */}
              <div className="h-[110px] sm:h-[130px] w-full bg-muted overflow-hidden shrink-0">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover block"
                    // loading="lazy"
                    onError={(e) => {
                      // ne pas faire display:none -> garder la zone image stable
                      (e.currentTarget as HTMLImageElement).src = "";
                      (e.currentTarget as HTMLImageElement).alt = "Image indisponible";
                    }}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                    Pas d’image
                  </div>
                )}
              </div>

              {/* Zone texte : prend le reste, tronque */}
              <CardContent className="px-3 pb-2 pt-2 flex-1 flex flex-col min-h-0">
                {/* Title + description */}
                <div className="min-h-0">
                  <div className="line-clamp-1 font-medium leading-tight">{item.title}</div>

                  {item.subtitle ? (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground leading-snug">
                      {item.subtitle}
                    </p>
                  ) : null}
                </div>

                {/* Spacer: pousse le badge en bas */}
                <div className="flex-1" />

                {/* Footer / owner */}
                {item.ownerName ? (
                  <div className="pt-1 flex justify-end">
                    <Badge variant="secondary" className="max-w-full truncate">
                      {item.ownerName}
                    </Badge>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>

        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
