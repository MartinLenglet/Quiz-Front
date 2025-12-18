import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UpdateThemeQuestion, type QuestionDraft } from "./UpdateThemeQuestion";

type Props = {
  themeTitle: string;
  questions: QuestionDraft[];
  onChangeQuestion: (id: string, patch: Partial<QuestionDraft>) => void;
  onAddQuestion: () => void;
  onRemoveLastQuestion: () => void;
};

export function UpdateThemeQuestionsList({
  themeTitle,
  questions,
  onChangeQuestion,
  onAddQuestion,
  onRemoveLastQuestion,
}: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Questions ({questions.length})</CardTitle>

        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onRemoveLastQuestion}>
            -1
          </Button>
          <Button type="button" variant="secondary" onClick={onAddQuestion}>
            +1
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {questions.map((q, idx) => (
          <UpdateThemeQuestion
            key={q.id}
            index={idx}
            themeTitle={themeTitle}
            question={q}
            onChange={(patch) => onChangeQuestion(q.id, patch)}
            showSeparator={idx < questions.length - 1}
          />
        ))}
      </CardContent>
    </Card>
  );
}
