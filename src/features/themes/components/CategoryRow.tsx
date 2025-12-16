import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

  const scrollBy = (dx: number) => {
    viewportRef.current?.scrollBy({ left: dx, behavior: "smooth" });
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>

        <div className="hidden sm:flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => scrollBy(-520)} aria-label="Défiler à gauche">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => scrollBy(520)} aria-label="Défiler à droite">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="w-full">
        <div
          ref={viewportRef}
          className="flex gap-4 overflow-x-auto pb-4 pr-2"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {items.map((item) => (
            <Card
              key={item.id}
              className="min-w-[220px] max-w-[220px] cursor-pointer overflow-hidden"
              style={{ scrollSnapAlign: "start" }}
              onClick={item.onClick}
              role={item.onClick ? "button" : undefined}
              tabIndex={item.onClick ? 0 : undefined}
              onKeyDown={(e) => {
                if (!item.onClick) return;
                if (e.key === "Enter" || e.key === " ") item.onClick();
              }}
            >
              <div className="aspect-[16/9] w-full bg-muted">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : null}
              </div>

              <CardContent className="flex h-full flex-col p-3">
                {/* Titre */}
                <div className="line-clamp-1 font-medium">{item.title}</div>

                {/* Description */}
                {item.subtitle ? (
                    <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {item.subtitle}
                    </div>
                ) : null}

                {/* Spacer pour pousser le badge en bas */}
                <div className="flex-1" />

                {/* Badge owner aligné à droite */}
                {item.ownerName ? (
                    <div className="mt-2 flex justify-end">
                    <Badge variant="secondary">{item.ownerName}</Badge>
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
