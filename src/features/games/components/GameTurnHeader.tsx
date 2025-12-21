import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { GameStateOut } from "@/features/games/schemas/games.schemas";

type Props = {
  state: GameStateOut;
  onUseJoker: (jokerInGameId: number) => void;
  disabled?: boolean;
};

export function GameTurnHeader({ state, onUseJoker, disabled }: Props) {
  const turn = state.current_turn;
  const turnLabel = turn ? `Tour de ${turn.player.name}` : "Tour —";

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-lg font-semibold">{turnLabel}</div>
        <div className="text-sm text-muted-foreground">
          Round {turn?.round_number ?? "—"}
        </div>
      </div>

      <TooltipProvider>
        <div className="flex flex-wrap gap-2">
          {state.available_jokers.map((j) => {
            const isDisabled = disabled || !turn || !j.available;
            return (
              <Tooltip key={j.joker_in_game_id}>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant={j.available ? "secondary" : "outline"}
                    disabled={isDisabled}
                    onClick={() => onUseJoker(j.joker_in_game_id)}
                    className={!j.available ? "opacity-50" : undefined}
                  >
                    {j.joker.name}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <div className="space-y-1">
                    <div className="font-medium">{j.joker.name}</div>
                    <div className="text-sm text-muted-foreground">{j.joker.description}</div>
                    {!j.available ? (
                      <div className="text-xs text-muted-foreground">Déjà utilisé</div>
                    ) : null}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}
