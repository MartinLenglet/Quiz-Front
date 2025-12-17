import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { useMeQuery } from "@/features/auth/services/auth.queries";
import { useThemeByIdQuery } from "@/features/themes/services/themes.queries";

type Props = {
  redirectTo?: string; // où renvoyer si pas owner
  allowAdminBypass?: boolean;
};

export function ThemeOwnerRoute({ redirectTo = "/my-themes", allowAdminBypass = true }: Props) {
  const location = useLocation();
  const { themeId } = useParams();

  const parsedThemeId = themeId ? Number(themeId) : null;

  const meQuery = useMeQuery(true);
  const themeQuery = useThemeByIdQuery(parsedThemeId);

  // on attend les 2
  if (meQuery.isLoading || themeQuery.isLoading) return null;

  // si user pas là → laisse ProtectedRoute gérer normalement, mais on sécurise quand même
  if (meQuery.isError || !meQuery.data) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  }

  // theme introuvable / erreur -> redirect
  if (themeQuery.isError || !themeQuery.data) {
    return <Navigate to={redirectTo} replace />;
  }

  const user = meQuery.data;
  const theme = themeQuery.data;

  // admin bypass optionnel
  if (allowAdminBypass && user.admin) {
    return <Outlet />;
  }

  // owner only
  if (theme.owner_id !== user.id) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
