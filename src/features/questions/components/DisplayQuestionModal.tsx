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
  onRevealAnswer?: () => void | Promise<void>;
};

function MediaPanel({ media }: { media?: Media }) {
  const hasAudio = !!media?.audioUrl;
  const hasImage = !!media?.imageUrl;
  const hasVideo = !!media?.videoUrl;

  const visualsCount = Number(hasImage) + Number(hasVideo);
  const hasAnything = hasAudio || visualsCount > 0;

  if (!hasAnything) return null;

  return (
    <div className="w-full h-full min-h-0 flex flex-col gap-3">
      {/* AUDIO (fixe) */}
      {hasAudio ? (
        <audio className="w-full shrink-0" controls src={media!.audioUrl!} />
      ) : null}

      {/* VISUELS : prennent TOUT le reste */}
      {visualsCount > 0 ? (
        <div
          className={[
            "flex-1 min-h-0 w-full",
            "grid gap-3",
            visualsCount === 2 ? "grid-rows-2" : "grid-rows-1",
          ].join(" ")}
        >
          {hasImage ? (
            <div className="relative min-h-0 overflow-hidden">
              <img
                src={media!.imageUrl!}
                alt="Image"
                className="absolute inset-0 h-full w-full object-contain"
              />
            </div>
          ) : null}

          {hasVideo ? (
            <div className="relative min-h-0 overflow-hidden">
              <video
                className="absolute inset-0 h-full w-full object-contain"
                controls
                src={media!.videoUrl!}
              />
            </div>
          ) : null}
        </div>
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
  onRevealAnswer,
}: Props) {
  const [showAnswer, setShowAnswer] = React.useState(false);
  const [revealBusy, setRevealBusy] = React.useState(false);

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
          <div 
          className="text-center font-semibold tracking-wide text-muted-foreground
            text-base
            md:text-lg
            lg:text-xl"
          >
            {turnLabel ?? "Tour de XXXX"}
          </div>

          <DialogTitle className="text-xl text-center md:text-2xl lg:text-3xl">
            {themeTitle || "Thème"}
          </DialogTitle>
        </DialogHeader>

        {/* BODY (scrollable) */}
        <div className="flex-1 min-h-0 overflow-auto pr-1">
          <div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:items-stretch md:h-[60vh] min-h-0">
            {/* LEFT */}
            <div className="space-y-4 md:self-stretch min-h-0">
              <div className="space-y-2">
                <div className="text-sm font-medium md:text-base lg:text-lg">Question</div>
                <div
                  className="
                    rounded-md border
                    p-3 text-sm leading-relaxed whitespace-pre-wrap
                    md:p-4 md:text-base
                    lg:p-5 lg:text-lg
                    xl:p-6 xl:text-xl
                  "
                >
                  {questionText || <span className="text-muted-foreground">—</span>}
                </div>
              </div>

              {showAnswer ? (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-sm font-medium md:text-base lg:text-lg">Réponse</div>
                    <div
                      className="
                        rounded-md border
                        p-3 text-sm leading-relaxed whitespace-pre-wrap
                        md:p-4 md:text-base
                        lg:p-5 lg:text-lg
                        xl:p-6 xl:text-xl
                      "
                    >
                      {answerText || <span className="text-muted-foreground">—</span>}
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* RIGHT */}
            <div
              className="
                min-h-0
                overflow-hidden
                flex items-center justify-center
                h-[42vh] sm:h-[46vh]
                md:h-full
              "
            >
              <MediaPanel media={rightMedia} />
            </div>
          </div>
        </div>

        {/* FOOTER (toujours en bas) */}
        <DialogFooter className="pt-4">
          {!showAnswer ? (
            <div className="w-full flex justify-center">
              <Button
                type="button"
                disabled={revealBusy}
                onClick={async () => {
                  setRevealBusy(true);
                  try {
                    await onRevealAnswer?.();
                    setShowAnswer(true);
                  } finally {
                    setRevealBusy(false);
                  }
                }}
              >
                {revealBusy ? "Chargement…" : "Afficher la réponse"}
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
