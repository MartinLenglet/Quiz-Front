import * as React from "react";
import { cn } from "@/lib/utils";
import { DialogContent } from "@/components/ui/dialog";

/**
 * DialogContent "desktop-first" :
 * - beaucoup plus large sur grands écrans
 * - garde une marge sur petits écrans
 * - neutralise les max-width imposés par shadcn
 */
export function LargeDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  return (
    <DialogContent
      {...props}
      className={cn(
        // 🔥 On neutralise les max-width du composant shadcn
        // - base: max-w calc(100%-2rem)
        // - sm: max-w-lg
        // Ici on force notre largeur.
        "!max-w-none sm:!max-w-none",

        // ✅ Largeur "bureau" (priorité grands écrans)
        // - Sur mobile: largeur quasi pleine
        // - Sur desktop: large
        "w-[96vw] md:w-[92vw] lg:w-[min(1400px,92vw)] xl:w-[min(1600px,92vw)]",

        // ✅ Hauteur confortable + scroll géré dans le contenu
        "h-[88vh] max-h-[920px] overflow-hidden",

        className
      )}
    />
  );
}
