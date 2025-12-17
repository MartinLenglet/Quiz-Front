import * as React from "react";
import { Button } from "@/components/ui/button";
import { UpdateThemeGlobalInfo } from "./UpdateThemeGlobalInfo";
import { UpdateThemeQuestionsList } from "./UpdateThemeQuestionsList";
import type { QuestionDraft } from "./UpdateThemeQuestion";
import type { ThemeCategory } from "@/features/themes/schemas/themes.schemas";

type Props = {
  themeId: number | null;
  categories: ThemeCategory[];
  defaultQuestionsCount: number;
  categoriesLoading: boolean;
};

export function UpdateThemeForm({
  themeId,
  categories,
  defaultQuestionsCount,
  categoriesLoading,
}: Props) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [categoryId, setCategoryId] = React.useState<number | null>(null);
  const [coverImage, setCoverImage] = React.useState<File | null>(null);
  const [isPublic, setIsPublic] = React.useState(false);
  const [isReady, setIsReady] = React.useState(false);

  const [questions, setQuestions] = React.useState<QuestionDraft[]>(() =>
    Array.from({ length: defaultQuestionsCount }).map((_, idx) => ({
      id: `q-${idx + 1}-${crypto.randomUUID()}`,
      questionText: "",
      answerText: "",
      questionImage: null,
      questionAudio: null,
      answerImage: null,
      answerAudio: null,
    }))
  );

  function updateQuestion(id: string, patch: Partial<QuestionDraft>) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  function addQuestion() {
    setQuestions((prev) => [
      ...prev,
      {
        id: `q-${prev.length + 1}-${crypto.randomUUID()}`,
        questionText: "",
        answerText: "",
        questionImage: null,
        questionAudio: null,
        answerImage: null,
        answerAudio: null,
      },
    ]);
  }

  function removeLastQuestion() {
    setQuestions((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // API à venir
    console.log("UPDATE_THEME_DRAFT", {
      themeId,
      name,
      description,
      categoryId,
      coverImage,
      isPublic,
      isReady,
      questions,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <UpdateThemeGlobalInfo
        name={name}
        description={description}
        categoryId={categoryId}
        coverImage={coverImage}
        isPublic={isPublic}
        isReady={isReady}
        categories={categories}
        categoriesLoading={categoriesLoading}
        onNameChange={setName}
        onDescriptionChange={setDescription}
        onCategoryChange={setCategoryId}
        onCoverImageChange={setCoverImage}
        onIsPublicChange={setIsPublic}
        onIsReadyChange={setIsReady}
      />

      <UpdateThemeQuestionsList
        questions={questions}
        onChangeQuestion={updateQuestion}
        onAddQuestion={addQuestion}
        onRemoveLastQuestion={removeLastQuestion}
      />

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {themeId ? `Theme ID: ${themeId}` : "Theme ID indisponible"}
        </div>
        <Button type="submit">Enregistrer</Button>
      </div>
    </form>
  );
}
