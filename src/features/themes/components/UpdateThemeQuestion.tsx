import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export type QuestionDraft = {
  id: string;
  questionText: string;
  answerText: string;
  questionImage?: File | null;
  questionAudio?: File | null;
  answerImage?: File | null;
  answerAudio?: File | null;
};

type Props = {
  index: number;
  question: QuestionDraft;
  onChange: (patch: Partial<QuestionDraft>) => void;
  showSeparator?: boolean;
};

export function UpdateThemeQuestion({
  index,
  question,
  onChange,
  showSeparator = true,
}: Props) {
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
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => onChange({ questionImage: e.target.files?.[0] ?? null })}
          />
        </div>
        <div className="space-y-2">
          <Label>Audio question (optionnel)</Label>
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
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => onChange({ answerImage: e.target.files?.[0] ?? null })}
          />
        </div>
        <div className="space-y-2">
          <Label>Audio réponse (optionnel)</Label>
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
