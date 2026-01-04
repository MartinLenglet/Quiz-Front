import { z } from "zod";
import { httpRequest } from "@/lib/api";
import {
  bonusPublicSchema,
  colorPublicSchema,
  gameCreateInSchema,
  gameCreateOutSchema,
  gameSetupSuggestInSchema,
  gameSetupSuggestOutSchema,
  gameWithPlayersOutSchema,
  jokerPublicSchema,
  gameStateOutSchema,
  gameResultsOutSchema,
} from "../schemas/games.schemas";

const listSchema = <T extends z.ZodTypeAny>(item: T) => z.array(item);

export function listMyGames() {
  return httpRequest({
    method: "GET",
    path: "/games/me",
    responseSchema: listSchema(gameWithPlayersOutSchema),
  });
}

export function createGame(payload: unknown) {
  const parsed = gameCreateInSchema.parse(payload);

  return httpRequest({
    method: "POST",
    path: "/games",
    body: parsed,
    responseSchema: gameCreateOutSchema,
  });
}

export function listJokers() {
  return httpRequest({
    method: "GET",
    path: "/games/jokers",
    responseSchema: listSchema(jokerPublicSchema),
  });
}

export function listBonus() {
  return httpRequest({
    method: "GET",
    path: "/games/bonus",
    responseSchema: listSchema(bonusPublicSchema),
  });
}

export function listColorsPublic(params?: { offset?: number; limit?: number }) {
  return httpRequest({
    method: "GET",
    path: "/games/colors",
    params: {
      offset: params?.offset ?? 0,
      limit: params?.limit ?? 500,
    },
    responseSchema: listSchema(colorPublicSchema),
    withAuth: false, // endpoint public, optionnel mais propre
  });
}

export function suggestSetup(payload: unknown) {
  const parsed = gameSetupSuggestInSchema.parse(payload);

  return httpRequest({
    method: "POST",
    path: "/games/suggest-setup",
    body: parsed,
    responseSchema: gameSetupSuggestOutSchema,
  });
}

export function getGameState(gameUrl: string) {
  return httpRequest({
    method: "GET",
    path: `/games/${encodeURIComponent(gameUrl)}/state`,
    responseSchema: gameStateOutSchema,
  });
}

const jokerUseOutSchema = z.object({
  id: z.number().int(),
  joker_in_game_id: z.number().int(),
  round_id: z.number().int(),
  target_player_id: z.number().int().nullable().optional(),
  target_grid_id: z.number().int().nullable().optional(),
});
export type JokerUseOut = z.infer<typeof jokerUseOutSchema>;

export function useJoker(gameUrl: string, payload: unknown) {
  return httpRequest({
    method: "POST",
    path: `/games/${encodeURIComponent(gameUrl)}/jokers/use`,
    body: payload,
    responseSchema: jokerUseOutSchema,
  });
}

/** POST /games/{game_url}/answers */
const roundCreateOutSchema = z.object({
  id: z.number().int(),
  player_id: z.number().int(),
  round_number: z.number().int(),
});

const answerCreateOutSchema = z.object({
  grid_id: z.number().int(),
  round_id: z.number().int(),
  correct_answer: z.boolean(),
  skip_answer: z.boolean(),
  next_round: roundCreateOutSchema,
});
export type AnswerCreateOut = z.infer<typeof answerCreateOutSchema>;

export function answerQuestion(
  gameUrl: string,
  payload: unknown,
  params?: { auto_next_round?: boolean }
) {
  return httpRequest({
    method: "POST",
    path: `/games/${encodeURIComponent(gameUrl)}/answers`,
    params: { auto_next_round: params?.auto_next_round ?? true },
    body: payload,
    responseSchema: answerCreateOutSchema,
  });
}

export function getGameResults(gameUrl: string) {
  return httpRequest({
    method: "GET",
    path: `/games/${encodeURIComponent(gameUrl)}/results`,
    responseSchema: gameResultsOutSchema,
  });
}