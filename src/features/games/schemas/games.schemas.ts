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
  max_full_turns: z.number().int(),
  current_full_turn_number: z.number().int(),
});
export type GameStateOut = z.infer<typeof gameStateOutSchema>;

/** -------- Game results -------- */

export const playerResultOutSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  order: z.number().int(),
  theme: themeOutSchema,
  color: colorOutSchema,
});
export type PlayerResultOut = z.infer<typeof playerResultOutSchema>;

export const turnScoreOutSchema = z.object({
  turn_number: z.number().int(),
  scores: z.record(z.string(), z.coerce.number().int()),
  delta: z.record(z.string(), z.coerce.number().int()),
});
export type TurnScoreOut = z.infer<typeof turnScoreOutSchema>;

export const jokerImpactOutSchema = z.object({
  usage_id: z.number().int(),
  turn_number: z.number().int(),
  round_id: z.number().int(),
  round_number: z.number().int(),
  using_player_id: z.number().int(),
  joker_in_game_id: z.number().int(),
  joker_id: z.number().int(),
  joker_name: z.string(),
  target_player_id: z.number().int().nullable().optional(),
  target_grid_id: z.number().int().nullable().optional(),
  points_delta_by_player: z.record(z.string(), z.coerce.number().int()),
});
export type JokerImpactOut = z.infer<typeof jokerImpactOutSchema>;

export const bonusRankingItemOutSchema = z.object({
  rank: z.number().int(),
  player_id: z.number().int(),
  value: z.number().int(),
});
export type BonusRankingItemOut = z.infer<typeof bonusRankingItemOutSchema>;

export const bonusComputedEffectOutSchema = z.object({
  key: z.string(),
  metric_by_player: z.record(z.string(), z.coerce.number().int()),
  ranking: z.array(bonusRankingItemOutSchema),
  points_delta_by_player: z.record(z.string(), z.coerce.number().int()),
});
export type BonusComputedEffectOut = z.infer<typeof bonusComputedEffectOutSchema>;

export const bonusEffectOutSchema = z.object({
  bonus_in_game_id: z.number().int(),
  bonus: z.object({
    id: z.number().int(),
    name: z.string(),
    description: z.string(),
  }),
  effect: bonusComputedEffectOutSchema.nullable().optional(),
  points_delta_by_player: z.record(z.string(), z.coerce.number().int()).default({}),
});
export type BonusEffectOut = z.infer<typeof bonusEffectOutSchema>;

export const gameResultsOutSchema = z.object({
  game: gameMetaOutSchema,
  players: z.array(playerResultOutSchema),

  scores: z.record(z.string(), z.coerce.number().int()),
  scores_with_bonus: z.record(z.string(), z.coerce.number().int()),

  turn_scores: z.array(turnScoreOutSchema),
  jokers_impacts: z.array(jokerImpactOutSchema),

  bonus: z.array(bonusEffectOutSchema),
});
export type GameResultsOut = z.infer<typeof gameResultsOutSchema>;