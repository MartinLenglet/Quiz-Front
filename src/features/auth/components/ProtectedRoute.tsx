import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useMeQuery } from "../services/auth.queries";
import { HttpError } from "@/lib/api";

export function ProtectedRoute({ requireAdmin = false, redirectTo = "/sign-in" }) {
  const location = useLocation();
  const { data: user, isLoading, isFetching, error } = useMeQuery(true);

  // Pendant un fetch/refetch, évite de trancher trop vite
  if (isLoading || isFetching) return null;

  const status = error instanceof HttpError ? error.status : null;

  // Seulement si on est sûr que ce n'est plus authentifié
  if (status === 401 || !user) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  // Si erreur réseau/5xx: ne déconnecte pas, affiche plutôt un fallback
  if (error) {
    return <div>Impossible de vérifier la session (réseau/serveur). Réessaie.</div>;
  }

  if (requireAdmin && !user.admin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
