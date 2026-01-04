import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createGame,
  listBonus,
  listColorsPublic,
  listJokers,
  listMyGames,
  suggestSetup,
  getGameState,
  useJoker,
  answerQuestion,
  getGameResults,
} from "./games.services";

export const gamesKeys = {
  all: ["games"] as const,
  mine: () => [...gamesKeys.all, "mine"] as const,
  jokers: () => [...gamesKeys.all, "jokers"] as const,
  bonus: () => [...gamesKeys.all, "bonus"] as const,
  colors: (params: { offset: number; limit: number }) => [...gamesKeys.all, "colors", params] as const,
  suggest: () => [...gamesKeys.all, "suggest-setup"] as const,
  state: (gameUrl: string) => [...gamesKeys.all, "state", gameUrl] as const,
  results: (gameUrl: string) => [...gamesKeys.all, "results", gameUrl] as const,
};

export function useMyGamesQuery() {
  return useQuery({
    queryKey: gamesKeys.mine(),
    queryFn: () => listMyGames(),
  });
}

export function useJokersQuery() {
  return useQuery({
    queryKey: gamesKeys.jokers(),
    queryFn: () => listJokers(),
  });
}

export function useBonusQuery() {
  return useQuery({
    queryKey: gamesKeys.bonus(),
    queryFn: () => listBonus(),
  });
}

export function useColorsPublicQuery(params?: { offset?: number; limit?: number }) {
  const effective = { offset: params?.offset ?? 0, limit: params?.limit ?? 500 };
  return useQuery({
    queryKey: gamesKeys.colors(effective),
    queryFn: () => listColorsPublic(effective),
  });
}

export function useSuggestSetupMutation() {
  return useMutation({
    mutationFn: (payload: unknown) => suggestSetup(payload),
  });
}

export function useCreateGameMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) => createGame(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: gamesKeys.mine() });
    },
  });
}

export function useGameStateQuery(gameUrl: string | undefined) {
  return useQuery({
    queryKey: gameUrl ? gamesKeys.state(gameUrl) : ["games", "state", "missing"],
    queryFn: () => getGameState(gameUrl as string),
    enabled: !!gameUrl,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 30_000, // ✅ important
    retry: 1,
  });
}

export function useUseJokerMutation(gameUrl: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) => useJoker(gameUrl, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: gamesKeys.state(gameUrl) });
      qc.invalidateQueries({ queryKey: gamesKeys.results(gameUrl) });
    },
  });
}

export function useAnswerQuestionMutation(gameUrl: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { payload: unknown; auto_next_round?: boolean }) =>
      answerQuestion(gameUrl, args.payload, { auto_next_round: args.auto_next_round }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: gamesKeys.state(gameUrl) });
      qc.invalidateQueries({ queryKey: gamesKeys.results(gameUrl) });
    },
  });
}

export function useGameResultsQuery(gameUrl: string | undefined) {
  return useQuery({
    queryKey: gameUrl ? gamesKeys.results(gameUrl) : ["games", "results", "missing"],
    queryFn: () => getGameResults(gameUrl as string),
    enabled: !!gameUrl,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
    retry: 1,
  });
}
