import { Button } from "@/components/ui/button"
import { TypographyH1 } from "@/components/ui/typography"

export default function HomePage() {
  return (
    <>
      <TypographyH1 text="Bienvenue sur la page d’accueil"></TypographyH1>
      <div className="flex min-h-svh flex-col items-center justify-center">
        <Button variant="outline">Click me</Button>
      </div>
    </>
  )
}
