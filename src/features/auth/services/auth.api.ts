import { httpRequest } from "@/lib/api";
import {
  ChangePasswordInSchema,
  SignInInSchema,
  SignUpInSchema,
  TokenPairOutSchema,
  UserOutSchema,
  type ChangePasswordIn,
  type SignInIn,
  type SignUpIn,
} from "../schemas/auth.schemas";

/**
 * POST /api/auth/sign-up (proxy -> /api/v1/auth/sign-up)
 * Retour: UserOut
 */
export function signUp(payload: SignUpIn) {
  const body = SignUpInSchema.parse(payload);
  return httpRequest({
    method: "POST",
    path: "/auth/sign-up",
    body,
    responseSchema: UserOutSchema,
    withAuth: false,
  });
}

/**
 * POST /api/auth/sign-in (proxy -> /api/v1/auth/sign-in)
 * Retour: TokenPairOut (access/refresh; refresh aussi en cookie httpOnly)
 */
export function signIn(payload: SignInIn) {
  const body = SignInInSchema.parse(payload);
  return httpRequest({
    method: "POST",
    path: "/auth/sign-in",
    body,
    responseSchema: TokenPairOutSchema,
    withAuth: false,
  });
}

/**
 * POST /api/auth/refresh (proxy -> /api/v1/auth/refresh)
 * Optionnel: généralement géré automatiquement par lib/api.ts sur 401.
 * Mais utile si tu veux déclencher un refresh manuel (ex: au boot).
 */
export function refresh() {
  return httpRequest({
    method: "POST",
    path: "/auth/refresh",
    body: null,
    responseSchema: TokenPairOutSchema,
    withAuth: false, // refresh se base sur cookie httpOnly, pas sur bearer
  });
}

/**
 * POST /api/auth/logout (proxy -> /api/v1/auth/logout)
 * Révoque le refresh (cookie httpOnly). Retour 204.
 */
export function logout() {
  return httpRequest<void>({
    method: "POST",
    path: "/auth/logout",
    body: null,
    withAuth: true,
  });
}

/**
 * GET /api/auth/me (proxy -> /api/v1/auth/me)
 * Nécessite Bearer access token. Retour: UserOut
 */
export function me() {
  return httpRequest({
    method: "GET",
    path: "/auth/me",
    responseSchema: UserOutSchema,
    withAuth: true,
  });
}

/**
 * POST /api/auth/change-password (proxy -> /api/v1/auth/change-password)
 * Retour 204.
 */
export function changePassword(payload: ChangePasswordIn) {
  const body = ChangePasswordInSchema.parse(payload);
  return httpRequest<void>({
    method: "POST",
    path: "/auth/change-password",
    body,
    withAuth: true,
  });
}
