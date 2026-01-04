import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { GameWithPlayersOut } from "../schemas/games.schemas";

type Props = {
  games?: GameWithPlayersOut[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onContinue: (gameUrl: string) => void;
  onResults: (gameUrl: string) => void;
};

export function MyGamesTable({
  games,
  isLoading,
  isError,
  errorMessage,
  onContinue,
  onResults,
}: Props) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">Chargement…</CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">
          {errorMessage ?? "Erreur lors du chargement des parties."}
        </CardContent>
      </Card>
    );
  }

  const rows = games ?? [];

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Partie</TableHead>
              <TableHead>Grille</TableHead>
              <TableHead>État</TableHead>
              <TableHead>Joueurs</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  Aucune partie pour le moment.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-medium">{g.url}</TableCell>
                  <TableCell>
                    {g.rows_number}×{g.columns_number}
                  </TableCell>
                  <TableCell>{g.finished ? "Terminée" : "En cours"}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {g.players
                        .slice()
                        .sort((a, b) => a.order - b.order)
                        .map((p) => (
                          <span key={p.id} className="text-sm">
                            {p.order}. {p.name} — <span className="text-muted-foreground">{p.theme.name}</span>
                          </span>
                        ))}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="inline-flex items-center justify-end gap-2">
                      <Button onClick={() => onContinue(g.url)} disabled={g.finished}>
                        Continuer
                      </Button>

                      <Button onClick={() => onResults(g.url)} disabled={!g.finished}>
                        Résultats
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
