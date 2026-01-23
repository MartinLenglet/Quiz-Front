# Quiz-Front Copilot Instructions

## Architecture Overview

This is a **React + TypeScript + Vite** quiz game frontend. The project uses **shadcn/ui** (Radix UI + Tailwind) for components and queries the backend quiz API.

### Core Stack
- **Build**: Vite with React plugin and Tailwind CSS via `@tailwindcss/vite`
- **Data Layer**: TanStack Query (`@tanstack/react-query`) for server state
- **Routing**: React Router v7 with protected routes
- **Forms**: React Hook Form + Zod validation
- **Auth**: Token-based (localStorage + in-memory), verified via `/api/auth/me`

### Directory Structure
```
src/
├── app/           # Router configuration
├── components/    # UI library (shadcn/ui) + custom components
├── features/      # Feature modules (auth, games, themes, questions, images, audios, videos)
│   └── {feature}/
│       ├── components/   # Feature-specific React components
│       ├── schemas/      # Zod validation schemas (input/output)
│       └── services/     # API calls (.services.ts) & TanStack Query hooks (.queries.ts)
├── lib/          # Utilities (api.ts, tokenStorage.ts, useElementSize.ts, utils.ts)
└── pages/        # Page components (one per route)
```

## Critical Patterns

### 1. **Service Layer Architecture** (Three-File Pattern)
Every feature uses a consistent pattern:

```typescript
// schemas/games.schemas.ts
export const gameCreateInSchema = z.object({ /* validation */ });
export type GameCreateIn = z.infer<typeof gameCreateInSchema>;
export const gameCreateOutSchema = z.object({ /* response */ });

// services/games.services.ts
export function createGame(payload: unknown) {
  const parsed = gameCreateInSchema.parse(payload);
  return httpRequest({
    method: "POST",
    path: "/games",
    body: parsed,
    responseSchema: gameCreateOutSchema,
  });
}

// services/games.queries.ts
export function useCreateGameMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) => createGame(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: gamesKeys.mine() });
    },
  });
}
```

**Key Rules**:
- Always parse input with Zod in `.services.ts` before calling `httpRequest`
- Always validate responses with `responseSchema`
- Use React Query hook wrappers in `.queries.ts` to manage mutation/query state
- Keep cache keys organized (see `gamesKeys` object pattern)

### 2. **HTTP Request Handling** ([api.ts](src/lib/api.ts))
Custom wrapper that:
- Automatically includes JWT token (Authorization header) from `tokenStorage`
- Handles 401 errors with token refresh (retry once with `_retried` flag)
- Converts paths like `/auth/me` → `${API_ORIGIN}/api/v1/auth/me` (v1 added by backend)
- Validates response with Zod schema
- Dev proxy: `/api` → `http://localhost:8080/api/v1` (vite.config.ts)
- Prod: Uses `VITE_API_URL` if defined

**Usage**:
```typescript
httpRequest<TOutput>({
  method: "GET|POST|PUT|PATCH|DELETE",
  path: "/games/me",
  params?: { key: value },           // Query params
  body?: object,                      // Auto-JSON or FormData
  responseSchema?: zodSchema,         // Validate response
  withAuth?: boolean,                 // default: true
})
```

### 3. **Authentication Flow**
- **Entry Point**: `useMeQuery()` in Navbar (always enabled)
- **Protected Routes**: Wrap with `<ProtectedRoute />` or `<ProtectedRoute requireAdmin />` 
- **Token Storage**: Hybrid (in-memory + localStorage) for security + persistence
- **Logout**: Clear both storage and invalidate React Query `authKeys.me()`
- **Sign-up + Sign-in**: Use `useSignUpAndSignInMutation()` for atomic flow

See [ProtectedRoute.tsx](src/features/auth/components/ProtectedRoute.tsx) for error handling (distinguishes 401 from network errors).

### 4. **Styling Conventions**
- **Tailwind CSS** classes for all styling (no CSS files)
- **shadcn/ui** components use CVA (class-variance-authority) for variants
- **Utility**: `cn()` from [utils.ts](src/lib/utils.ts) for conditional classes (clsx wrapper)
- **Dark Mode**: Supported via Tailwind's `dark:` prefix
- **Typography**: Use `<Typography />` component for consistent text styles

Example:
```tsx
<Button variant="destructive" size="sm" className="w-full">
  Delete
</Button>
```

### 5. **Form Handling** (React Hook Form + Zod)
```typescript
const form = useForm({
  resolver: zodResolver(mySchema),
  defaultValues: { /* ... */ },
});

// In JSX: <form onSubmit={form.handleSubmit(onSubmit)}>
// Fields: use form.register() or Controller for complex inputs
```

Common pattern: validate with Zod schema, then call service mutation.

### 6. **React Query Cache Management**
- **Stale Time**: 30s for game state (refetchOnMount/WindowFocus: false)
- **Retry**: Usually 1 retry, disabled for auth queries
- **Keys**: Nested arrays (e.g., `["games", "state", gameUrl]`) for predictable invalidation
- **Invalidation**: After mutation, use `qc.invalidateQueries({ queryKey: [key] })`

### 7. **Feature-Specific Patterns**
- **Games**: Grid-based quiz game with players, jokers, bonuses, themes
- **Themes**: User-created content for questions (categoryId-based)
- **Auth**: Sign-up/in/out + change password + user verification
- **Questions, Images, Audios, Videos**: Nested resources within themes/games
- **Owner Routes**: `<ThemeOwnerRoute />` checks ownership before rendering (with optional admin bypass)

## Development Workflow

### Scripts
```bash
npm run dev       # Start Vite dev server (HMR enabled)
npm run build     # Compile TypeScript + build Vite bundle
npm run lint      # Run ESLint
npm run preview   # Preview production build locally
npm run deploy    # Push dist to GitHub Pages
```

### Environment Setup
- **Dev**: Backend at `http://localhost:8080`, proxied via `/api`
- **Prod**: Set `VITE_API_URL` env var if backend is on different domain

### API Reference (FastAPI Backend)
The backend is a FastAPI Python app with auto-generated OpenAPI documentation:
- **Swagger UI**: `http://localhost:8080/docs` — Interactive API explorer with request/response examples
- **ReDoc**: `http://localhost:8080/redoc` — Alternative documentation format
- **OpenAPI Schema**: `http://localhost:8080/openapi.json` — Raw OpenAPI spec (import into tools)

**When implementing services**: Fetch the Swagger UI documentation (`http://localhost:8080/docs`) to verify endpoint paths, required parameters, request body structure, and response schemas. Use available tools (e.g., fetch_webpage) to access the OpenAPI docs directly. This is the source of truth for backend contracts.

### TypeScript Config
- Base URL: `@` = `src/` (path aliasing in tsconfig.json + vite.config.ts)
- Target: ES2020 with JSX support

## Common Tasks

### Add a New Feature
1. Create `src/features/{feature}/`
2. Add schemas in `schemas/{feature}.schemas.ts` (Zod)
3. Implement services in `services/{feature}.services.ts` (httpRequest calls)
4. Create queries in `services/{feature}.queries.ts` (React Query hooks)
5. Build components in `components/` that consume queries
6. Add routes in [router.tsx](src/app/router.tsx)

### Add a UI Component
- Copy from shadcn/ui templates → `src/components/ui/`
- Or create custom in `src/components/custom/`
- Always export as named export function

### Handle Network Errors
- HttpError has `.status` (integer) for distinction (401 vs 500)
- ProtectedRoute falls back to "Impossible de vérifier la session" on network errors
- Mutations should display error message from `error?.message` or `error?.body`

## Key Files to Know
- [api.ts](src/lib/api.ts) — HTTP request wrapper with auth + Zod validation
- [tokenStorage.ts](src/lib/tokenStorage.ts) — JWT token lifecycle
- [router.tsx](src/app/router.tsx) — All routes + protected route config
- [vite.config.ts](vite.config.ts) — Build config + API proxy
- [eslint.config.js](eslint.config.js) — Linting rules
