import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { SignUpInSchema } from "../schemas/auth.schemas";
import { useSignUpAndSignInMutation } from "../services/auth.queries";

type FormValues = z.infer<typeof SignUpInSchema>;

export function SignUpForm() {
  const navigate = useNavigate();
  const signUpMutation = useSignUpAndSignInMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(SignUpInSchema),
    defaultValues: { username: "", password: "" },
    mode: "onSubmit",
  });

  async function onSubmit(values: FormValues) {
    await signUpMutation.mutateAsync(values);
    navigate("/", { replace: true });
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Créer un compte</CardTitle>
        <CardDescription>Choisis un nom d’utilisateur et un mot de passe.</CardDescription>
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
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={signUpMutation.isPending}>
              {signUpMutation.isPending ? "Création..." : "Créer le compte"}
            </Button>

            {signUpMutation.isError ? (
              <p className="text-sm text-destructive">
                Impossible de créer le compte. Vérifie les champs (username 3-64, mot de passe 8-128).
              </p>
            ) : null}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
