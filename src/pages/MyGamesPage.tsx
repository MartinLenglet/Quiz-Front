import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { CreateGameModal } from "@/features/games/components/CreateGameModal";
import { MyGamesTable } from "@/features/games/components/MyGamesTable";
import { useMyGamesQuery } from "@/features/games/services/games.queries";

export default function MyGamesPage() {
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const myGamesQuery = useMyGamesQuery();
  const { data, isLoading, isError, error } = myGamesQuery;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-6 py-6 pl-6 sm:pl-8 lg:pl-12">
        <h1 className="text-3xl font-semibold">Mes parties</h1>

        <p className="text-sm text-muted-foreground">
          Retrouvez ici vos parties, et reprenez une partie en cours.
        </p>

        <Button onClick={() => setIsCreateOpen(true)} disabled={isLoading && !data}>
          Créer une partie
        </Button>
      </div>

      <CreateGameModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={(game) => {
          myGamesQuery.refetch();
          navigate(`/games/${game.url}`);
        }}
      />

      <div className="px-6 sm:px-8 lg:px-12">
        <MyGamesTable
          games={data}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error instanceof Error ? error.message : undefined}
          onContinue={(gameUrl) => navigate(`/games/${gameUrl}`)}
          onResults={(gameUrl) => navigate(`/games/${gameUrl}/results`)}
        />
      </div>
    </div>
  );
}