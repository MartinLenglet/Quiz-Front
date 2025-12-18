import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export type QuestionDraft = {
  id: string;
  backendId?: number;

  questionText: string;
  answerText: string;

  questionImage?: File | null;
  questionAudio?: File | null;
  answerImage?: File | null;
  answerAudio?: File | null;

  existingQuestionImageUrl?: string | null;
  existingAnswerImageUrl?: string | null;
  existingQuestionAudioUrl?: string | null;
  existingAnswerAudioUrl?: string | null;

  existingQuestionVideoUrl?: string | null;
  existingAnswerVideoUrl?: string | null;
};

type Props = {
  index: number;
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
  question,
  onChange,
  showSeparator = true,
}: Props) {
  const questionImagePreview = useObjectUrl(question.questionImage ?? null);
  const answerImagePreview = useObjectUrl(question.answerImage ?? null);
  const questionAudioPreview = useObjectUrl(question.questionAudio ?? null);
  const answerAudioPreview = useObjectUrl(question.answerAudio ?? null);

  // Affiche soit le fichier nouvellement choisi, soit l’existant (API), soit rien
  const questionImageSrc = questionImagePreview ?? question.existingQuestionImageUrl ?? null;
  const answerImageSrc = answerImagePreview ?? question.existingAnswerImageUrl ?? null;

  const questionAudioSrc = questionAudioPreview ?? question.existingQuestionAudioUrl ?? null;
  const answerAudioSrc = answerAudioPreview ?? question.existingAnswerAudioUrl ?? null;

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">Question {index + 1}</div>

      <div className="space-y-2">
        <Label>Question (texte)</Label>
        <Input
          value={question.questionText}
          onChange={(e) => onChange({ questionText: e.target.value })}
          placeholder="Ex: Qui a réalisé Inception ?"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Image question (optionnel)</Label>

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
          <Label>Audio question (optionnel)</Label>

          {questionAudioSrc ? (
            <audio className="w-full" controls src={questionAudioSrc} />
          ) : null}

          <Input
            type="file"
            accept="audio/*"
            onChange={(e) => onChange({ questionAudio: e.target.files?.[0] ?? null })}
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
          <Label>Audio réponse (optionnel)</Label>

          {answerAudioSrc ? <audio className="w-full" controls src={answerAudioSrc} /> : null}

          <Input
            type="file"
            accept="audio/*"
            onChange={(e) => onChange({ answerAudio: e.target.files?.[0] ?? null })}
          />
        </div>
      </div>

      {showSeparator ? <Separator /> : null}
    </div>
  );
}
