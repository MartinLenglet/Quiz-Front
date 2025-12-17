import { z } from "zod";
import { tokenStorage } from "./tokenStorage";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiParams = Record<string, string | number | boolean | null | undefined>;

export class HttpError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    super(`HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

/**
 * En dev : on veut taper "/api/..." pour profiter du proxy Vite.
 * En prod : si VITE_API_URL est défini, on tape "${VITE_API_URL}/api/..."
 */
const API_ORIGIN = import.meta.env.VITE_API_URL ?? "";
const API_PREFIX = "/api";

function buildUrl(path: string, params?: ApiParams): string {
  // path attendu: "/auth/me", "/auth/sign-in", etc. (SANS /v1)
  const base = API_ORIGIN ? `${API_ORIGIN}${API_PREFIX}` : API_PREFIX;
  const url = new URL(`${base}${path}`, window.location.origin);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function parseBody(res: Response): Promise<unknown> {
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

type HttpRequestOptions<TSchema extends z.ZodTypeAny | undefined> = {
  method: HttpMethod;
  path: string; // ex: "/auth/me" (SANS /v1)
  params?: ApiParams;
  body?: unknown;
  responseSchema?: TSchema;
  withAuth?: boolean; // default true
  _retried?: boolean;
};

export async function httpRequest<TOutput, TSchema extends z.ZodTypeAny | undefined = undefined>(
  options: HttpRequestOptions<TSchema>
): Promise<TSchema extends z.ZodTypeAny ? z.infer<TSchema> : TOutput> {
  tokenStorage.initFromStorage();

  const headers: Record<string, string> = {};

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.withAuth !== false) {
    const token = tokenStorage.getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(buildUrl(options.path, options.params), {
    method: options.method,
    headers,
    credentials: "include",
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const data = await parseBody(res);

  // refresh auto sur 401 (une seule fois)
  if (res.status === 401 && options.withAuth !== false && !options._retried) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return httpRequest<TOutput, TSchema>({ ...options, _retried: true });
    }
  }

  if (!res.ok) {
    throw new HttpError(res.status, data);
  }

  if (options.responseSchema) {
    return options.responseSchema.parse(data) as any;
  }

  return data as any;
}

async function tryRefresh(): Promise<boolean> {
  try {
    // IMPORTANT : côté front => "/api/auth/refresh" (proxy => "/api/v1/auth/refresh")
    const res = await fetch(buildUrl("/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(null),
    });

    if (!res.ok) return false;

    const data = await res.json();

    if (data && typeof data === "object" && "access_token" in data && typeof (data as any).access_token === "string") {
      tokenStorage.setAccessToken((data as any).access_token);
      return true;
    }

    return false;
  } catch {
    return false;
  }
}