import * as React from "react";
import { Button } from "@/components/ui/button";
import { UpdateThemeGlobalInfo } from "./UpdateThemeGlobalInfo";
import { UpdateThemeQuestionsList } from "./UpdateThemeQuestionsList";
import type { QuestionDraft } from "./UpdateThemeQuestion";
import type { ThemeCategory, ThemeDetailJoinWithSignedUrlOut } from "@/features/themes/schemas/themes.schemas";

type Props = {
  themeId: number | null;
  theme: ThemeDetailJoinWithSignedUrlOut | null;
  themeLoading: boolean;

  categories: ThemeCategory[];
  defaultQuestionsCount: number;
  categoriesLoading: boolean;
};

function buildBlankQuestions(count: number): QuestionDraft[] {
  return Array.from({ length: count }).map((_, idx) => ({
    id: `q-${idx + 1}-${crypto.randomUUID()}`,
    questionText: "",
    answerText: "",
    points: 1,
    questionImage: null,
    questionAudio: null,
    answerImage: null,
    answerAudio: null,
  }));
}

export function UpdateThemeForm({
  themeId,
  theme,
  themeLoading,
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

  const [questions, setQuestions] = React.useState<QuestionDraft[]>(
    () => buildBlankQuestions(defaultQuestionsCount)
  );

  React.useEffect(() => {
    if (!theme) return;

    setName(theme.name ?? "");
    setDescription(theme.description ?? "");
    setCategoryId(theme.category_id ?? null);
    setIsPublic(Boolean(theme.is_public));
    setIsReady(Boolean(theme.is_ready));

    // ⚠️ file inputs : impossible de préremplir un File programmaticalement
    // donc coverImage reste null (mais tu peux afficher l'image actuelle ailleurs si besoin)
    setCoverImage(null);

    const mapped: QuestionDraft[] = (theme.questions ?? []).map((q) => ({
      id: `qid-${q.id}`,       // id UI stable
      backendId: q.id,         // id backend

      questionText: q.question ?? "",
      answerText: q.answer ?? "",
      points: q.points ?? 1,

      // nouveaux fichiers = null au départ
      questionImage: null,
      questionAudio: null,
      answerImage: null,
      answerAudio: null,

      // existants (API)
      existingQuestionImageUrl: q.question_image_signed_url ?? null,
      existingAnswerImageUrl: q.answer_image_signed_url ?? null,
      existingQuestionAudioUrl: q.question_audio_signed_url ?? null,
      existingAnswerAudioUrl: q.answer_audio_signed_url ?? null,

      // si tu veux gérer la vidéo plus tard
      existingQuestionVideoUrl: q.question_video_signed_url ?? null,
      existingAnswerVideoUrl: q.answer_video_signed_url ?? null,
    }));

    // pad pour garder au moins defaultQuestionsCount
    const padded =
      mapped.length >= defaultQuestionsCount
        ? mapped
        : [...mapped, ...buildBlankQuestions(defaultQuestionsCount - mapped.length)];

    setQuestions(padded);
  }, [theme, defaultQuestionsCount]);

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
        points: 1,
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

  if (themeLoading) {
    return <div className="text-sm text-muted-foreground">Chargement du thème…</div>;
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
        categoryName={theme?.category_name ?? null}
        existingCoverImageUrl={theme?.image_signed_url ?? null}
        onNameChange={setName}
        onDescriptionChange={setDescription}
        onCategoryChange={setCategoryId}
        onCoverImageChange={setCoverImage}
        onIsPublicChange={setIsPublic}
        onIsReadyChange={setIsReady}
      />

      <UpdateThemeQuestionsList
        themeTitle={name}
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
