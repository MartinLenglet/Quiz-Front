const ACCESS_TOKEN_KEY = "access_token";

let inMemoryAccessToken: string | null = null;

export const tokenStorage = {
  initFromStorage(): void {
    if (inMemoryAccessToken) return;
    const stored = localStorage.getItem(ACCESS_TOKEN_KEY);
    inMemoryAccessToken = stored ?? null;
  },

  getAccessToken(): string | null {
    return inMemoryAccessToken;
  },

  setAccessToken(token: string): void {
    inMemoryAccessToken = token;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  clear(): void {
    inMemoryAccessToken = null;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
};
