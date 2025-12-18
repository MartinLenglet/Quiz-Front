import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { DisplayQuestionModal } from "@/features/questions/components/DisplayQuestionModal";

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

  // Previews locaux si user choisit un fichier
  const qImgLocal = useObjectUrl(question.questionImage ?? null);
  const aImgLocal = useObjectUrl(question.answerImage ?? null);
  const qAudLocal = useObjectUrl(question.questionAudio ?? null);
  const aAudLocal = useObjectUrl(question.answerAudio ?? null);

  // Sources affichées: local si présent, sinon existant API
  const questionImageSrc = qImgLocal ?? question.existingQuestionImageUrl ?? null;
  const answerImageSrc = aImgLocal ?? question.existingAnswerImageUrl ?? null;
  const questionAudioSrc = qAudLocal ?? question.existingQuestionAudioUrl ?? null;
  const answerAudioSrc = aAudLocal ?? question.existingAnswerAudioUrl ?? null;

  const questionVideoSrc = question.existingQuestionVideoUrl ?? null;
  const answerVideoSrc = question.existingAnswerVideoUrl ?? null;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-medium">Question {index + 1}</div>
        <Button type="button" variant="secondary" onClick={() => setPreviewOpen(true)}>
          Prévisualiser
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2 sm:col-span-2">
          <Label>Question (texte)</Label>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Image question (optionnel)</Label>

          {/* preview existant si pas de nouveau file, sinon preview local */}
          {questionImageSrc && !question.questionImage ? (
            <img
              src={questionImageSrc}
              alt={`Image question ${index + 1}`}
              className="max-h-48 w-auto rounded-md border"
            />
          ) : null}
          {qImgLocal ? (
            <img
              src={qImgLocal}
              alt={`Nouvelle image question ${index + 1}`}
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
          <Label>Audio question (optionnel)</Label>

          {questionAudioSrc && !question.questionAudio ? (
            <audio className="w-full" controls src={questionAudioSrc} />
          ) : null}
          {qAudLocal ? <audio className="w-full" controls src={qAudLocal} /> : null}

          <Input
            type="file"
            accept="audio/*"
            onChange={(e) => onChange({ questionAudio: e.target.files?.[0] ?? null })}
          />
        </div>

        <div className="space-y-2">
          <Label>Vidéo question (optionnel)</Label>
          {questionVideoSrc ? (
            <video className="w-full rounded-md border" controls src={questionVideoSrc} />
          ) : null}

          <Input
            type="file"
            accept="video/*"
            onChange={(e) =>
              onChange({ questionVideo: e.target.files?.[0] ?? null })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Réponse (texte)</Label>
        <Input
          value={question.answerText}
          onChange={(e) => onChange({ answerText: e.target.value })}
          placeholder="Ex: Christopher Nolan"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Image réponse (optionnel)</Label>

          {answerImageSrc && !question.answerImage ? (
            <img
              src={answerImageSrc}
              alt={`Image réponse ${index + 1}`}
              className="max-h-48 w-auto rounded-md border"
            />
          ) : null}
          {aImgLocal ? (
            <img
              src={aImgLocal}
              alt={`Nouvelle image réponse ${index + 1}`}
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
          <Label>Audio réponse (optionnel)</Label>

          {answerAudioSrc && !question.answerAudio ? (
            <audio className="w-full" controls src={answerAudioSrc} />
          ) : null}
          {aAudLocal ? <audio className="w-full" controls src={aAudLocal} /> : null}

          <Input
            type="file"
            accept="audio/*"
            onChange={(e) => onChange({ answerAudio: e.target.files?.[0] ?? null })}
          />
        </div>
      </div>

      <DisplayQuestionModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        themeTitle={themeTitle}
        points={question.points}
        // turnLabel optionnel : en édition on laisse le placeholder
        questionText={question.questionText}
        answerText={question.answerText}
        questionMedia={{
          imageUrl: questionImageSrc,
          audioUrl: questionAudioSrc,
          videoUrl: questionVideoSrc,
        }}
        answerMedia={{
          imageUrl: answerImageSrc,
          audioUrl: answerAudioSrc,
          videoUrl: answerVideoSrc,
        }}
        autoCloseOnAction={true} // ton besoin: fermer sur n'importe quel bouton
      />

      {showSeparator ? <Separator /> : null}
    </div>
  );
}