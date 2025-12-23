import logo from "@/assets/logo_banquiz.png";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";

import { useMeQuery, useLogoutMutation } from "@/features/auth";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { data: user, isLoading } = useMeQuery(true);
  const logoutMutation = useLogoutMutation();

  const isAuthenticated = !!user;

  const links = [
    { to: "/", label: "Accueil" },
    { to: "/my-games", label: "Mes Parties" },
    { to: "/my-themes", label: "Mes Thèmes" },
    { to: "/about", label: "À propos" },
  ];

  function handleLogout() {
    logoutMutation.mutate();
    setOpen(false);
    navigate("/");
  }

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold">
          <img src={logo} alt="Banquiz Logo" className="h-8 w-8" />
        </Link>

        {/* Menu desktop */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {links.map((l) => (
              <NavigationMenuItem key={l.to}>
                <NavigationMenuLink asChild>
                  <Link
                    to={l.to}
                    className="px-3 py-2 text-sm font-medium hover:text-primary transition-colors"
                  >
                    {l.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Actions desktop */}
        <div className="hidden md:flex items-center gap-2">
          {!isLoading && !isAuthenticated && (
            <>
              <Button variant="default" asChild>
                <Link to="/sign-up">Créer un compte</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/sign-in">Connexion</Link>
              </Button>
            </>
          )}

          {!isLoading && isAuthenticated && (
            <>
              <Button variant="default" asChild>
                <Link to="/account">Mon compte</Link>
              </Button>
              <Button
                variant="secondary"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                Déconnexion
              </Button>
            </>
          )}
        </div>

        {/* Menu mobile */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-[240px] sm:w-[300px]">
            <SheetHeader className="mb-4 pl-4">
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Navigation principale de l’application
              </SheetDescription>
            </SheetHeader>

            <nav className="flex flex-col gap-3 mt-4 pl-4">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  {l.label}
                </Link>
              ))}

              {/* Actions mobile */}
              {!isLoading && !isAuthenticated && (
                <>
                  <Button
                    variant="secondary"
                    className="mt-4 w-fit"
                    asChild
                    onClick={() => setOpen(false)}
                  >
                    <Link to="/sign-in">Connexion</Link>
                  </Button>
                  <Button
                    className="mt-2 w-fit"
                    asChild
                    onClick={() => setOpen(false)}
                  >
                    <Link to="/sign-up">Créer un compte</Link>
                  </Button>
                </>
              )}

              {!isLoading && isAuthenticated && (
                <>
                  <Button
                    className="mt-4 w-fit"
                    asChild
                    onClick={() => setOpen(false)}
                  >
                    <Link to="/account">Mon compte</Link>
                  </Button>
                  <Button
                    variant="secondary"
                    className="mt-2 w-fit"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    Déconnexion
                  </Button>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
