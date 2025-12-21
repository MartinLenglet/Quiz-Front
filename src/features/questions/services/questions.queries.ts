import { useQuery } from "@tanstack/react-query";
import { getQuestionById } from "./questions.services";

export const questionsKeys = {
  all: ["questions"] as const,
  byId: (id: number, withSigned: boolean) => [...questionsKeys.all, "by-id", id, withSigned] as const,
};

export function useQuestionByIdQuery(questionId: number | null | undefined, opts?: { with_signed_url?: boolean }) {
  const withSigned = opts?.with_signed_url ?? true;

  return useQuery({
    queryKey:
      typeof questionId === "number"
        ? questionsKeys.byId(questionId, withSigned)
        : ["questions", "by-id", "missing"],
    queryFn: () => getQuestionById(questionId as number, { with_signed_url: withSigned }),
    enabled: typeof questionId === "number",
    refetchOnWindowFocus: false,
    staleTime: 60_000,
    retry: 1,
  });
}
