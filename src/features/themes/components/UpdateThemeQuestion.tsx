import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { DisplayQuestionModal } from "@/features/questions/components/DisplayQuestionModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type QuestionDraft = {
  id: string;
  backendId?: number;

  questionText: string;
  answerText: string;
  points: number;

  questionImage?: File | null;
  questionAudio?: File | null;
  questionVideo?: File | null;
  answerImage?: File | null;
  answerAudio?: File | null;
  answerVideo?: File | null;

  existingQuestionImageUrl?: string | null;
  existingQuestionAudioUrl?: string | null;
  existingQuestionVideoUrl?: string | null;
  existingAnswerImageUrl?: string | null;
  existingAnswerAudioUrl?: string | null;
  existingAnswerVideoUrl?: string | null;
  
  // IDs existants (indispensable pour PATCH)
  existingQuestionImageId?: number | null;
  existingQuestionAudioId?: number | null;
  existingQuestionVideoId?: number | null;
  existingAnswerImageId?: number | null;
  existingAnswerAudioId?: number | null;
  existingAnswerVideoId?: number | null;
};

type Props = {
  index: number;
  themeTitle: string;
  question: QuestionDraft;
  onChange: (patch: Partial<QuestionDraft>) => void;
  showSeparator?: boolean;
};

function useObjectUrl(file: File | null | undefined) {
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return url;
}

export function UpdateThemeQuestion({
  index,
  themeTitle,
  question,
  onChange,
  showSeparator = true,
}: Props) {
  const [previewOpen, setPreviewOpen] = React.useState(false);

  // Local previews (selected files)
  const qImgLocal = useObjectUrl(question.questionImage ?? null);
  const qAudLocal = useObjectUrl(question.questionAudio ?? null);
  const qVidLocal = useObjectUrl(question.questionVideo ?? null);

  const aImgLocal = useObjectUrl(question.answerImage ?? null);
  const aAudLocal = useObjectUrl(question.answerAudio ?? null);
  const aVidLocal = useObjectUrl(question.answerVideo ?? null);

  // Display sources (local > existing API)
  const questionAudioSrc = qAudLocal ?? question.existingQuestionAudioUrl ?? null;
  const questionImageSrc = qImgLocal ?? question.existingQuestionImageUrl ?? null;
  const questionVideoSrc = qVidLocal ?? question.existingQuestionVideoUrl ?? null;

  const answerAudioSrc = aAudLocal ?? question.existingAnswerAudioUrl ?? null;
  const answerImageSrc = aImgLocal ?? question.existingAnswerImageUrl ?? null;
  const answerVideoSrc = aVidLocal ?? question.existingAnswerVideoUrl ?? null;

  return (
    <div className="space-y-4">
      {/* Header: question number + preview */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="text-lg px-3 py-1 font-bold"
          >
            #{index + 1}
          </Badge>

          <div className="text-lg font-bold tracking-wide">
            Question {index + 1}
          </div>
        </div>


        <Button type="button" variant="secondary" onClick={() => setPreviewOpen(true)}>
          Prévisualiser
        </Button>
      </div>

      {/* ===== QUESTION (texte + médias dans le même conteneur) ===== */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base">Question</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-6 lg:grid-cols-2">
          {/* LEFT — texte */}
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-2">
                <Label>Texte</Label>
                <Input
                  value={question.questionText}
                  onChange={(e) => onChange({ questionText: e.target.value })}
                  placeholder="Ex: Qui a réalisé Inception ?"
                />
              </div>

              <div className="space-y-2">
                <Label>Points</Label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={Number.isFinite(question.points) ? question.points : 0}
                  onChange={(e) => onChange({ points: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* RIGHT — médias (Audio -> Image -> Vidéo) */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Audio</Label>
              {questionAudioSrc ? <audio className="w-full" controls src={questionAudioSrc} /> : null}
              <Input
                type="file"
                accept="audio/*"
                onChange={(e) => onChange({ questionAudio: e.target.files?.[0] ?? null })}
              />
            </div>

            <div className="space-y-2">
              <Label>Image</Label>
              {questionImageSrc ? (
                <img
                  src={questionImageSrc}
                  alt={`Image question ${index + 1}`}
                  className="max-h-48 w-auto rounded-md border"
                />
              ) : null}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => onChange({ questionImage: e.target.files?.[0] ?? null })}
              />
            </div>

            <div className="space-y-2">
              <Label>Vidéo</Label>
              {questionVideoSrc ? (
                <video className="w-full rounded-md border" controls src={questionVideoSrc} />
              ) : null}
              <Input
                type="file"
                accept="video/*"
                onChange={(e) => onChange({ questionVideo: e.target.files?.[0] ?? null })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== RÉPONSE (texte + médias dans le même conteneur) ===== */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base">Réponse</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-6 lg:grid-cols-2">
          {/* LEFT — texte */}
          <div className="space-y-2">
            <Label>Texte</Label>
            <Input
              value={question.answerText}
              onChange={(e) => onChange({ answerText: e.target.value })}
              placeholder="Ex: Christopher Nolan"
            />
          </div>

          {/* RIGHT — médias (Audio -> Image -> Vidéo) */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Audio</Label>
              {answerAudioSrc ? <audio className="w-full" controls src={answerAudioSrc} /> : null}
              <Input
                type="file"
                accept="audio/*"
                onChange={(e) => onChange({ answerAudio: e.target.files?.[0] ?? null })}
              />
            </div>

            <div className="space-y-2">
              <Label>Image</Label>
              {answerImageSrc ? (
                <img
                  src={answerImageSrc}
                  alt={`Image réponse ${index + 1}`}
                  className="max-h-48 w-auto rounded-md border"
                />
              ) : null}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => onChange({ answerImage: e.target.files?.[0] ?? null })}
              />
            </div>

            <div className="space-y-2">
              <Label>Vidéo</Label>
              {answerVideoSrc ? (
                <video className="w-full rounded-md border" controls src={answerVideoSrc} />
              ) : null}
              <Input
                type="file"
                accept="video/*"
                onChange={(e) => onChange({ answerVideo: e.target.files?.[0] ?? null })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview modal */}
      <DisplayQuestionModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        themeTitle={themeTitle}
        points={question.points}
        questionText={question.questionText}
        answerText={question.answerText}
        questionMedia={{
          audioUrl: questionAudioSrc,
          imageUrl: questionImageSrc,
          videoUrl: questionVideoSrc,
        }}
        answerMedia={{
          audioUrl: answerAudioSrc,
          imageUrl: answerImageSrc,
          videoUrl: answerVideoSrc,
        }}
        autoCloseOnAction={true}
      />

      {showSeparator ? <Separator /> : null}
    </div>
  );
}
