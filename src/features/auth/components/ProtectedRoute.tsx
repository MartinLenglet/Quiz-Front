import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useMeQuery } from "../services/auth.queries";

type ProtectedRouteProps = {
  requireAdmin?: boolean;
  redirectTo?: string;
};

export function ProtectedRoute({ requireAdmin = false, redirectTo = "/sign-in" }: ProtectedRouteProps) {
  const location = useLocation();
  const { data: user, isLoading, isError } = useMeQuery(true);

  if (isLoading) return null;

  // Pas connecté (ou token invalide/expiré)
  if (isError || !user) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  // Connecté mais pas admin, et route admin requise
  if (requireAdmin && !user.admin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
