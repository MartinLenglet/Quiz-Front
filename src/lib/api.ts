export type ApiParams = Record<string, string | number | boolean | null | undefined>;

function withParams(path: string, params?: ApiParams) {
  const url = new URL(`/api${path}`, window.location.origin);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export async function httpGet<T>(path: string, params?: ApiParams): Promise<T> {
  const res = await fetch(withParams(path, params));
  if (!res.ok) throw new Error(await res.text().catch(() => `HTTP ${res.status}`));
  return res.json() as Promise<T>;
}
