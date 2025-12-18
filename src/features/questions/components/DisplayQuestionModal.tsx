import * as React from "react";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LargeDialogContent } from "@/components/custom/large-dialog";

type Media = {
  imageUrl?: string | null;
  audioUrl?: string | null;
  videoUrl?: string | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  themeTitle: string;

  // ✅ nouveau: points en header
  points: number;

  // ✅ nouveau: placeholder "Tour de XXXX" (customisable plus tard)
  turnLabel?: string; // ex: "Tour de Alice" ; par défaut: "Tour de XXXX"

  questionText: string;
  answerText: string;

  questionMedia?: Media;
  answerMedia?: Media;

  autoCloseOnAction?: boolean;
  onGoodAnswer?: () => void;
  onBadAnswer?: () => void;
  onCancelQuestion?: () => void;
};

function MediaPanel({ media }: { media?: Media }) {
  const hasAnything = Boolean(media?.imageUrl || media?.audioUrl || media?.videoUrl);

  if (!hasAnything) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {media?.audioUrl ? (
          <audio className="w-full max-w-md" controls src={media.audioUrl} />
      ) : null}
      {media?.imageUrl ? (
          <img
          src={media.imageUrl}
          alt="Media image"
          className="max-h-80 max-w-full rounded-md border"
          />
      ) : null}

      {media?.videoUrl ? (
          <video
          className="max-h-80 w-full max-w-xl rounded-md border"
          controls
          src={media.videoUrl}
          />
      ) : null}
    </div>
  );
}


export function DisplayQuestionModal({
  open,
  onOpenChange,
  themeTitle,
  points,
  turnLabel,
  questionText,
  answerText,
  questionMedia,
  answerMedia,
  autoCloseOnAction = true,
  onGoodAnswer,
  onBadAnswer,
  onCancelQuestion,
}: Props) {
  const [showAnswer, setShowAnswer] = React.useState(false);

  React.useEffect(() => {
    if (open) setShowAnswer(false);
  }, [open]);

  const rightMedia = showAnswer ? answerMedia : questionMedia;

  function close() {
    onOpenChange(false);
  }

  function action(fn?: () => void) {
    fn?.();
    if (autoCloseOnAction) close();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <LargeDialogContent className="flex flex-col" showCloseButton={false}>
        {/* HEADER (fixe) */}
        <DialogHeader className="relative">
          {/* ✅ points en haut à droite */}
          <div className="absolute right-0 top-0 flex items-center gap-1 text-2xl font-bold">
            {points}
          </div>

          {/* ✅ placeholder "Tour de XXXX" au-dessus du thème */}
          <div className="text-center text-lg font-semibold tracking-wide text-muted-foreground">
            {turnLabel ?? "Tour de XXXX"}
          </div>

          <DialogTitle className="text-xl text-center">
            {themeTitle || "Thème"}
          </DialogTitle>
        </DialogHeader>

        {/* BODY (scrollable) */}
        <div className="flex-1 min-h-0 overflow-auto pr-1">
          <div className="grid gap-6 md:grid-cols-2 items-stretch h-full min-h-full">
            {/* LEFT */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Question</div>
                <div className="rounded-md border p-3 text-sm whitespace-pre-wrap">
                  {questionText || <span className="text-muted-foreground">—</span>}
                </div>
              </div>

              {showAnswer ? (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Réponse</div>
                    <div className="rounded-md border p-3 text-sm whitespace-pre-wrap">
                      {answerText || <span className="text-muted-foreground">—</span>}
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* RIGHT */}
            <div className="h-full min-h-full flex items-center justify-center">
                <MediaPanel media={rightMedia} />
            </div>
          </div>
        </div>

        {/* FOOTER (toujours en bas) */}
        <DialogFooter className="pt-4">
          {!showAnswer ? (
            <div className="w-full flex justify-center">
              <Button type="button" onClick={() => setShowAnswer(true)}>
                Afficher la réponse
              </Button>
            </div>
          ) : (
            <div className="w-full flex flex-wrap justify-center gap-2">
              <Button type="button" onClick={() => action(onGoodAnswer)}>
                Bonne réponse
              </Button>
              <Button type="button" onClick={() => action(onBadAnswer)}>
                Mauvaise réponse
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => action(onCancelQuestion)}
              >
                Annuler la question
              </Button>
            </div>
          )}
        </DialogFooter>
      </LargeDialogContent>
    </Dialog>
  );
}
