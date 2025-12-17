import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { SignInInSchema } from "../schemas/auth.schemas";
import { useSignInMutation } from "../services/auth.queries";

type FormValues = z.infer<typeof SignInInSchema>;

export function SignInForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const signInMutation = useSignInMutation();

  const from = (location.state as { from?: string } | null)?.from ?? "/account";

  const form = useForm<FormValues>({
    resolver: zodResolver(SignInInSchema),
    defaultValues: { username: "", password: "" },
    mode: "onSubmit",
  });

  async function onSubmit(values: FormValues) {
    await signInMutation.mutateAsync(values);
    navigate(from, { replace: true });
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>Connecte-toi avec ton nom d’utilisateur et ton mot de passe.</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom d’utilisateur</FormLabel>
                  <FormControl>
                    <Input autoComplete="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={signInMutation.isPending}>
              {signInMutation.isPending ? "Connexion..." : "Se connecter"}
            </Button>

            {signInMutation.isError ? (
              <p className="text-sm text-destructive">
                Échec de connexion. Vérifie tes identifiants.
              </p>
            ) : null}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
