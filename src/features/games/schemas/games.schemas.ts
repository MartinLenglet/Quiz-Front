import { z } from "zod";

/** -------- Catalogues (public) -------- */
export const jokerPublicSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string(),
  requires_target_player: z.boolean(),
  requires_target_grid: z.boolean(),
});
export type JokerPublic = z.infer<typeof jokerPublicSchema>;

export const bonusPublicSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string(),
});
export type BonusPublic = z.infer<typeof bonusPublicSchema>;

export const colorPublicSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  hex_code: z.string(),
});
export type ColorPublic = z.infer<typeof colorPublicSchema>;

/** -------- My games list -------- */
export const themeOutSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});
export type ThemeOut = z.infer<typeof themeOutSchema>;

export const colorOutSchema = z.object({
  id: z.number().int(),
  hex_code: z.string(),
});
export type ColorOut = z.infer<typeof colorOutSchema>;

export const playerInGameOutSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  order: z.number().int(),
  color: colorOutSchema,
  theme: themeOutSchema,
});
export type PlayerInGameOut = z.infer<typeof playerInGameOutSchema>;

export const gameWithPlayersOutSchema = z.object({
  id: z.number().int(),
  url: z.string(),
  seed: z.number().int(),
  rows_number: z.number().int(),
  columns_number: z.number().int(),
  finished: z.boolean(),
  players: z.array(playerInGameOutSchema),
});
export type GameWithPlayersOut = z.infer<typeof gameWithPlayersOutSchema>;

/** -------- Create game -------- */
export const playerCreateInSchema = z.object({
  name: z.string().min(1).max(80),
  color_id: z.number().int().min(1),
  theme_id: z.number().int().min(1),
});

export const gameCreateInSchema = z.object({
  seed: z.number().int(),
  rows_number: z.number().int().min(1).max(50),
  columns_number: z.number().int().min(1).max(50),
  players: z.array(playerCreateInSchema).min(1).max(20),
  number_of_questions_by_player: z.number().int().min(1).max(50),
  general_theme_ids: z.array(z.number().int()).min(1),
  joker_ids: z.array(z.number().int()).optional().nullable(),
  bonus_ids: z.array(z.number().int()).optional().nullable(),
});
export type GameCreateIn = z.infer<typeof gameCreateInSchema>;

export const gameCreateOutSchema = z.object({
  id: z.number().int(),
  url: z.string(),
  seed: z.number().int(),
  rows_number: z.number().int(),
  columns_number: z.number().int(),
  finished: z.boolean(),
});
export type GameCreateOut = z.infer<typeof gameCreateOutSchema>;

/** -------- Suggest setup -------- */
export const playerSetupInSchema = z.object({
  theme_id: z.number().int(),
});
export const gameSetupSuggestInSchema = z.object({
  players: z.array(playerSetupInSchema).min(1).max(20),
});
export type GameSetupSuggestIn = z.infer<typeof gameSetupSuggestInSchema>;

export const gameSetupSuggestOutSchema = z.object({
  number_of_questions_by_player: z.number().int(),
  rows_number: z.number().int(),
  columns_number: z.number().int(),
  general_theme_ids: z.array(z.number().int()),
  joker_ids: z.array(z.number().int()),
  bonus_ids: z.array(z.number().int()),
});
export type GameSetupSuggestOut = z.infer<typeof gameSetupSuggestOutSchema>;

// Game state

export const currentTurnPlayerOutSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  order: z.number().int(),
  theme_id: z.number().int(),
});

export const gameMetaOutSchema = z.object({
  id: z.number().int(),
  url: z.string(),
  seed: z.number().int(),
  rows_number: z.number().int(),
  columns_number: z.number().int(),
  finished: z.boolean(),
  owner_id: z.number().int(),
});

export const gameStatePlayerSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  order: z.number().int(),
  theme_id: z.number().int(),
  color_id: z.number().int(),
});
export type GameStatePlayer = z.infer<typeof gameStatePlayerSchema>;

export const questionInGridOutSchema = z.object({
  id: z.number().int(),
  points: z.number().int(),
  theme: z.object({
    id: z.number().int(),
    name: z.string(),
  }),
});

export const gridCellOutSchema = z.object({
  grid_id: z.number().int(),
  row: z.number().int(),
  column: z.number().int(),
  round_id: z.number().int().nullable(),
  player_id: z.number().int().nullable(),
  correct_answer: z.boolean(),
  skip_answer: z.boolean(),
  question: questionInGridOutSchema,
});
export type GridCellOut = z.infer<typeof gridCellOutSchema>;

export const currentTurnOutSchema = z.object({
  round_id: z.number().int(),
  round_number: z.number().int(),
  player: z.object({
    id: z.number().int(),
    name: z.string(),
    order: z.number().int(),
    theme_id: z.number().int(),
  }),
});

export const jokerAvailabilityOutSchema = z.object({
  joker_in_game_id: z.number().int(),
  joker: z.object({
    id: z.number().int(),
    name: z.string(),
    description: z.string(),
    requires_target_player: z.boolean(),
    requires_target_grid: z.boolean(),
  }),
  available: z.boolean(),
});

export const bonusInGameOutSchema = z.object({
  bonus_in_game_id: z.number().int(),
  bonus: z.object({
    id: z.number().int(),
    name: z.string(),
    description: z.string(),
  }),
});

export const lastRoundDeltaOutSchema = z.object({
  round_id: z.number().int(),
  round_number: z.number().int(),
  delta: z.record(z.string(), z.coerce.number().int()), // clés JSON => string
});
export type LastRoundDeltaOut = z.infer<typeof lastRoundDeltaOutSchema>;

export const gameStateOutSchema = z.object({
  game: gameMetaOutSchema,
  players: z.array(gameStatePlayerSchema),
  grid: z.array(gridCellOutSchema),
  current_turn: currentTurnOutSchema.nullable(),

  available_jokers: z
    .record(z.string(), z.array(jokerAvailabilityOutSchema))
    .default({}),
  bonus: z.array(bonusInGameOutSchema).default([]),

  scores: z.record(z.string(), z.coerce.number().int()),

  last_round_delta: lastRoundDeltaOutSchema.nullable().optional(),
});
export type GameStateOut = z.infer<typeof gameStateOutSchema>;