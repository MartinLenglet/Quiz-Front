import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { useMeQuery } from "@/features/auth/services/auth.queries";
import { useGameStateQuery } from "@/features/games/services/games.queries";

type Props = {
  redirectTo?: string; // où renvoyer si pas owner
  allowAdminBypass?: boolean;
};

export function GameOwnerRoute({ redirectTo = "/my-games", allowAdminBypass = true }: Props) {
  const location = useLocation();
  const { gameUrl } = useParams<{ gameUrl: string }>();

  const meQuery = useMeQuery(true);
  const gameQuery = useGameStateQuery(gameUrl);

  // on attend les 2
  if (meQuery.isLoading || gameQuery.isLoading) return null;

  // si user pas là → laisse ProtectedRoute gérer, mais on sécurise
  if (meQuery.isError || !meQuery.data) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  }

  // game introuvable / erreur -> redirect
  if (gameQuery.isError || !gameQuery.data) {
    return <Navigate to={redirectTo} replace />;
  }

  const user = meQuery.data;
  const gameState = gameQuery.data;

  // admin bypass optionnel
  if (allowAdminBypass && user.admin) {
    return <Outlet />;
  }

  // owner only
  if (gameState.game.owner_id !== user.id) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
