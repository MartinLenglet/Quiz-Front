import { httpRequest } from "@/lib/api";
import { QuestionJoinWithSignedUrlOutSchema } from "@/features/questions/schemas/questions.schemas";

export function getQuestionById(questionId: number, params?: { with_signed_url?: boolean }) {
  return httpRequest({
    method: "GET",
    path: `/games/questions/${questionId}`,
    params: { with_signed_url: params?.with_signed_url ?? true },
    responseSchema: QuestionJoinWithSignedUrlOutSchema,
  });
}
