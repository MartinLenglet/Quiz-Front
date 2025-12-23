import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { GameStateOut } from "@/features/games/schemas/games.schemas";

type JokerAvailability = GameStateOut["available_jokers"][string][number];

type Props = {
  state: GameStateOut;
  onSelectJoker: (j: JokerAvailability) => void;
  disabled?: boolean;

  selectedJokerInGameId?: number | null;
  targeting?: boolean;
};

export function GameTurnHeader({
  state,
  onSelectJoker,
  disabled,
  selectedJokerInGameId,
  targeting,
}: Props) {
  const turn = state.current_turn;
  const turnLabel = turn ? `Tour de ${turn.player.name}` : "Tour —";

  const currentPlayerJokers = turn ? state.available_jokers[String(turn.player.id)] ?? [] : [];

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-lg font-semibold">{turnLabel}</div>
        <div className="text-sm text-muted-foreground">Round {turn?.round_number ?? "—"}</div>
      </div>

      <TooltipProvider>
        <div className="flex flex-wrap gap-2">
          {currentPlayerJokers.map((j) => {
            const isSelected = selectedJokerInGameId === j.joker_in_game_id;

            const lockOthers = !!targeting && !isSelected;
            const isDisabled = !!disabled || !turn || !j.available || lockOthers;

            return (
              <Tooltip key={j.joker_in_game_id}>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant={isSelected ? "default" : j.available ? "secondary" : "outline"}
                    disabled={isDisabled}
                    onClick={() => onSelectJoker(j)}
                    className={!j.available ? "opacity-50" : undefined}
                  >
                    {j.joker.name}
                  </Button>
                </TooltipTrigger>

                <TooltipContent className="max-w-sm">
                  <div className="space-y-1">
                    <div className="font-medium">{j.joker.name}</div>
                    <div className="text-sm text-muted-foreground">{j.joker.description}</div>

                    {j.joker.requires_target_grid || j.joker.requires_target_player ? (
                      <div className="text-xs text-muted-foreground">
                        Cible :{" "}
                        {j.joker.requires_target_grid ? "case" : null}
                        {j.joker.requires_target_grid && j.joker.requires_target_player ? " + " : null}
                        {j.joker.requires_target_player ? "joueur" : null}
                      </div>
                    ) : null}

                    {!j.available ? <div className="text-xs text-muted-foreground">Déjà utilisé</div> : null}
                    {targeting && isSelected ? (
                      <div className="text-xs text-muted-foreground">Reclique pour annuler</div>
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
