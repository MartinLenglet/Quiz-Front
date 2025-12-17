import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { ChangePasswordInSchema } from "../schemas/auth.schemas";
import { useChangePasswordMutation } from "../services/auth.queries";

type FormValues = z.infer<typeof ChangePasswordInSchema>;

export function ChangePasswordForm() {
  const mutation = useChangePasswordMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(ChangePasswordInSchema),
    defaultValues: { old_password: "", new_password: "" },
  });

  async function onSubmit(values: FormValues) {
    await mutation.mutateAsync(values);
    form.reset();
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Changer le mot de passe</CardTitle>
        <CardDescription>Ton token doit être valide.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="old_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ancien mot de passe</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nouveau mot de passe</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Changement..." : "Changer"}
            </Button>

            {mutation.isSuccess ? (
              <p className="text-sm">Mot de passe changé.</p>
            ) : null}

            {mutation.isError ? (
              <p className="text-sm text-destructive">
                Échec : ancien mot de passe invalide ou session expirée.
              </p>
            ) : null}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
