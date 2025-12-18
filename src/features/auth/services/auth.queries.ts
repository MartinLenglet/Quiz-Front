import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tokenStorage } from "@/lib/tokenStorage";
import { changePassword, logout, me, signIn, signUp } from "./auth.api";
import type { ChangePasswordIn, SignInIn, SignUpIn } from "../schemas/auth.schemas";

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export function useMeQuery(enabled = true) {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: me,
    enabled,
    retry: false,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}

export function useSignUpMutation() {
  return useMutation({
    mutationFn: (payload: SignUpIn) => signUp(payload),
  });
}

export function useSignInMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SignInIn) => signIn(payload),
    onSuccess: async (tokens) => {
      tokenStorage.setAccessToken(tokens.access_token);
      await qc.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

export function useLogoutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => logout(),
    onSuccess: async () => {
      tokenStorage.clear();
      qc.removeQueries({ queryKey: authKeys.me() });
      await qc.invalidateQueries({ queryKey: authKeys.me() });
    },
    onError: () => {
      // même si le backend échoue, on coupe localement la session
      tokenStorage.clear();
      qc.removeQueries({ queryKey: authKeys.me() });
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (payload: ChangePasswordIn) => changePassword(payload),
  });
}

export function useSignUpAndSignInMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SignUpIn) => {
      // 1) crée le compte
      await signUp(payload);

      // 2) connecte avec les mêmes identifiants
      return signIn({ username: payload.username, password: payload.password });
    },
    onSuccess: async (tokens) => {
      tokenStorage.setAccessToken(tokens.access_token);
      await qc.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}