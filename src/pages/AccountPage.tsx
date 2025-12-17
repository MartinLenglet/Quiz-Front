import { useNavigate } from "react-router-dom";
import { ChangePasswordForm, useLogoutMutation, useMeQuery } from "@/features/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AccountPage() {
  const navigate = useNavigate();
  const { data: user } = useMeQuery(true);
  const logout = useLogoutMutation();

  function handleLogout() {
    logout.mutate(undefined, {
      onSettled: () => {
        navigate("/", { replace: true });
      },
    });
  }

  return (
    <main className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mon compte</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Connecté en tant que</p>
              {user?.admin ? <Badge>Admin</Badge> : <Badge variant="secondary">Utilisateur</Badge>}
            </div>

            <p className="text-lg font-medium">{user?.username ?? "-"}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handleLogout}
              disabled={logout.isPending}
            >
              {logout.isPending ? "Déconnexion..." : "Se déconnecter"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ChangePasswordForm />
    </main>
  );
}
