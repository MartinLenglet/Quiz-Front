"use client";

import logo from "@/assets/logo_detoure.png";
import { Link } from "react-router-dom";
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

export function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: "Accueil" },
    { to: "/create_game", label: "Créer une partie" },
    { to: "/game/1", label: "Exemple de partie" },
    { to: "/about", label: "À propos" },
  ];

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold">
          <img src={logo} alt="Quiz Logo" className="h-8 w-8" />
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

        {/* Bouton à droite */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="default">Connexion</Button>
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
                <SheetDescription>Navigation principale de l’application</SheetDescription>
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
              <Button className="mt-4 w-fit" onClick={() => setOpen(false)}>
                Connexion
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
