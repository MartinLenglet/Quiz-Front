import * as React from "react";
import { Button } from "@/components/ui/button";
import { UpdateThemeGlobalInfo } from "./UpdateThemeGlobalInfo";
import { UpdateThemeQuestionsList } from "./UpdateThemeQuestionsList";
import type { QuestionDraft } from "./UpdateThemeQuestion";
import type {
  ThemeCategory,
  ThemeDetailJoinWithSignedUrlOut,
} from "@/features/themes/schemas/themes.schemas";

import { useUploadImageMutation } from "@/features/images/services/images.queries";
import { useUploadAudioMutation } from "@/features/audios/services/audios.queries";
import { useUploadVideoMutation } from "@/features/videos/services/videos.queries";
import { useUpdateThemeWithQuestionsMutation } from "@/features/themes/services/themes.queries";

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
    questionVideo: null,
    answerImage: null,
    answerAudio: null,
    answerVideo: null,

    // existing ids (none)
    existingQuestionImageId: null,
    existingQuestionAudioId: null,
    existingQuestionVideoId: null,
    existingAnswerImageId: null,
    existingAnswerAudioId: null,
    existingAnswerVideoId: null,

    // existing urls (none)
    existingQuestionImageUrl: null,
    existingQuestionAudioUrl: null,
    existingQuestionVideoUrl: null,
    existingAnswerImageUrl: null,
    existingAnswerAudioUrl: null,
    existingAnswerVideoUrl: null,
  }));
}

function mergeSignedUrlsIntoQuestions(
  prev: QuestionDraft[],
  theme: ThemeDetailJoinWithSignedUrlOut,
  defaultQuestionsCount: number
): QuestionDraft[] {
  const fromServer = new Map(
    (theme.questions ?? []).map((q) => [q.id, q])
  );

  const merged = prev.map((draft) => {
    if (!draft.backendId) return draft; // blank question ou pas encore liée au backend

    const serverQ = fromServer.get(draft.backendId);
    if (!serverQ) return draft;

    return {
      ...draft,

      // ✅ ne rafraîchir les URLs que si l'utilisateur n'a pas choisi un nouveau fichier
      existingQuestionImageUrl: draft.questionImage ? draft.existingQuestionImageUrl : (serverQ.question_image_signed_url ?? draft.existingQuestionImageUrl ?? null),
      existingAnswerImageUrl: draft.answerImage ? draft.existingAnswerImageUrl : (serverQ.answer_image_signed_url ?? draft.existingAnswerImageUrl ?? null),

      existingQuestionAudioUrl: draft.questionAudio ? draft.existingQuestionAudioUrl : (serverQ.question_audio_signed_url ?? draft.existingQuestionAudioUrl ?? null),
      existingAnswerAudioUrl: draft.answerAudio ? draft.existingAnswerAudioUrl : (serverQ.answer_audio_signed_url ?? draft.existingAnswerAudioUrl ?? null),

      existingQuestionVideoUrl: draft.questionVideo ? draft.existingQuestionVideoUrl : (serverQ.question_video_signed_url ?? draft.existingQuestionVideoUrl ?? null),
      existingAnswerVideoUrl: draft.answerVideo ? draft.existingAnswerVideoUrl : (serverQ.answer_video_signed_url ?? draft.existingAnswerVideoUrl ?? null),

      // IDs : en général stables, mais on peut les garder tels quels (ou resync si tu veux)
      existingQuestionImageId: serverQ.question_image_id ?? draft.existingQuestionImageId ?? null,
      existingAnswerImageId: serverQ.answer_image_id ?? draft.existingAnswerImageId ?? null,
      existingQuestionAudioId: serverQ.question_audio_id ?? draft.existingQuestionAudioId ?? null,
      existingAnswerAudioId: serverQ.answer_audio_id ?? draft.existingAnswerAudioId ?? null,
      existingQuestionVideoId: serverQ.question_video_id ?? draft.existingQuestionVideoId ?? null,
      existingAnswerVideoId: serverQ.answer_video_id ?? draft.existingAnswerVideoId ?? null,
    };
  });

  // ✅ si le serveur a moins de questions que le default, on conserve la taille (comme avant)
  return merged.length >= defaultQuestionsCount
    ? merged
    : [...merged, ...buildBlankQuestions(defaultQuestionsCount - merged.length)];
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
  const [existingCoverImageId, setExistingCoverImageId] =
    React.useState<number | null>(null);

  const uploadImage = useUploadImageMutation();
  const uploadAudio = useUploadAudioMutation();
  const uploadVideo = useUploadVideoMutation();

  const updateMutation = useUpdateThemeWithQuestionsMutation();

  const isBusy =
    uploadImage.isPending ||
    uploadAudio.isPending ||
    uploadVideo.isPending ||
    updateMutation.isPending;

  const [formError, setFormError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  
  const didInitRef = React.useRef(false);
  const lastThemeIdRef = React.useRef<number | null>(null);

  // (A) Reset du "flag init" quand on change de themeId (navigation vers un autre thème)
  React.useEffect(() => {
    if (themeId !== lastThemeIdRef.current) {
      didInitRef.current = false;
      lastThemeIdRef.current = themeId;

      // optionnel : remettre un état "blank" pendant le chargement d’un autre thème
      setQuestions(buildBlankQuestions(defaultQuestionsCount));
    }
  }, [themeId, defaultQuestionsCount]);

  // (B) Initialisation du formulaire UNE SEULE FOIS quand on reçoit le thème
  React.useEffect(() => {
    if (!theme) return;
    if (didInitRef.current) return;

    setName(theme.name ?? "");
    setDescription(theme.description ?? "");
    setCategoryId(theme.category_id ?? null);
    setIsPublic(Boolean(theme.is_public));
    setIsReady(Boolean(theme.is_ready));

    setCoverImage(null);
    setExistingCoverImageId(theme.image_id ?? null);

    const mapped: QuestionDraft[] = (theme.questions ?? []).map((q) => ({
      id: `qid-${q.id}`,
      backendId: q.id,

      questionText: q.question ?? "",
      answerText: q.answer ?? "",
      points: q.points ?? 1,

      questionImage: null,
      questionAudio: null,
      questionVideo: null,
      answerImage: null,
      answerAudio: null,
      answerVideo: null,

      existingQuestionImageUrl: q.question_image_signed_url ?? null,
      existingAnswerImageUrl: q.answer_image_signed_url ?? null,
      existingQuestionAudioUrl: q.question_audio_signed_url ?? null,
      existingAnswerAudioUrl: q.answer_audio_signed_url ?? null,
      existingQuestionVideoUrl: q.question_video_signed_url ?? null,
      existingAnswerVideoUrl: q.answer_video_signed_url ?? null,

      existingQuestionImageId: q.question_image_id ?? null,
      existingAnswerImageId: q.answer_image_id ?? null,
      existingQuestionAudioId: q.question_audio_id ?? null,
      existingAnswerAudioId: q.answer_audio_id ?? null,
      existingQuestionVideoId: q.question_video_id ?? null,
      existingAnswerVideoId: q.answer_video_id ?? null,
    }));

    const padded =
      mapped.length >= defaultQuestionsCount
        ? mapped
        : [...mapped, ...buildBlankQuestions(defaultQuestionsCount - mapped.length)];

    setQuestions(padded);

    didInitRef.current = true;
  }, [theme, defaultQuestionsCount]);

  // (C) Rafraîchissement des signed URLs à chaque refetch, sans toucher aux edits
  React.useEffect(() => {
    if (!theme) return;
    if (!didInitRef.current) return;

    setQuestions((prev) =>
      mergeSignedUrlsIntoQuestions(prev, theme, defaultQuestionsCount)
    );

    // Cover: on ne touche PAS au File local, mais on peut sync l'id existant
    setExistingCoverImageId((prev) => prev ?? theme.image_id ?? null);
  }, [theme?.image_signed_url, theme?.questions, defaultQuestionsCount]);


  function updateQuestion(id: string, patch: Partial<QuestionDraft>) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  function addQuestion() {
    setQuestions((prev) => [
      ...prev,
      ...buildBlankQuestions(1).map((q) => ({
        ...q,
        id: `q-${prev.length + 1}-${crypto.randomUUID()}`,
      })),
    ]);
  }

  function removeLastQuestion() {
    setQuestions((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!themeId) {
      setFormError("Theme ID indisponible");
      return;
    }

    try {
      // 1) Cover upload (if changed)
      let image_id: number | null = existingCoverImageId ?? null;
      if (coverImage) {
        const uploadedCover = await uploadImage.mutateAsync({ file: coverImage });
        image_id = uploadedCover.id;
      }

      // 2) Questions: upload new medias if any, else keep existing ids
      const questionsPayload = await Promise.all(
        questions.map(async (q) => {
          const qImageId = q.questionImage
            ? (await uploadImage.mutateAsync({ file: q.questionImage })).id
            : q.existingQuestionImageId ?? null;

          const aImageId = q.answerImage
            ? (await uploadImage.mutateAsync({ file: q.answerImage })).id
            : q.existingAnswerImageId ?? null;

          const qAudioId = q.questionAudio
            ? (await uploadAudio.mutateAsync({ file: q.questionAudio })).id
            : q.existingQuestionAudioId ?? null;

          const aAudioId = q.answerAudio
            ? (await uploadAudio.mutateAsync({ file: q.answerAudio })).id
            : q.existingAnswerAudioId ?? null;

          const qVideoId = q.questionVideo
            ? (await uploadVideo.mutateAsync({ file: q.questionVideo })).id
            : q.existingQuestionVideoId ?? null;

          const aVideoId = q.answerVideo
            ? (await uploadVideo.mutateAsync({ file: q.answerVideo })).id
            : q.existingAnswerVideoId ?? null;

          const trimmedQuestion = q.questionText.trim();
          const trimmedAnswer = q.answerText.trim();
          const isEmpty = trimmedQuestion.length === 0 && trimmedAnswer.length === 0;

          return {
            id: q.backendId, // keep if supported by backend
            question: trimmedQuestion,
            answer: trimmedAnswer,
            points: Number.isFinite(q.points) ? q.points : 0,

            question_image_id: qImageId,
            answer_image_id: aImageId,
            question_audio_id: qAudioId,
            answer_audio_id: aAudioId,
            question_video_id: qVideoId,
            answer_video_id: aVideoId,

            __isEmpty: isEmpty,
          };
        })
      );

      const cleanedQuestions = questionsPayload
        .filter((q) => !q.__isEmpty)
        .map(({ __isEmpty, ...rest }) => rest);

      // 3) PATCH payload
      const input = {
        name,
        description: description || null,
        image_id,
        category_id: categoryId ?? null,
        is_public: isPublic,
        is_ready: isReady,
        questions: cleanedQuestions,
      };

      await updateMutation.mutateAsync({ themeId, input });
      setSuccessMessage("Le thème a bien été enregistré.");
      setTimeout(() => {
        setSuccessMessage(null);
      }, 10_000); // 10 secondes
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erreur inconnue");
    }
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

      {successMessage ? (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      {formError ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
          {formError}
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {themeId ? `Theme ID: ${themeId}` : "Theme ID indisponible"}
        </div>

        <Button type="submit" disabled={isBusy}>
          {isBusy ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
