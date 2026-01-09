# Quiz-Front – AGENTS.md

## Stack Technique

- **Framework:** React 19 + TypeScript (strict)
- **Bundler:** Vite 7
- **Routing:** react-router-dom v7
- **Data fetching & cache:** TanStack Query (React Query)
- **Validation:** Zod v4
- **UI:** shadcn/ui (Radix UI) + Tailwind CSS v4

## Commands

```bash
# Development
pnpm dev          # Start dev server (port 5173)

# Build & Typecheck
pnpm build        # tsc -b && vite build

# Lint
pnpm lint         # eslint .

# Preview production build
pnpm preview
```

## Architecture

```
src/
├─ app/              # Routing config (router.tsx)
├─ pages/            # Page components (route screens)
├─ components/
│  ├─ ui/            # shadcn/ui design system components
│  └─ custom/        # App-level shared components (navbar, layouts)
├─ features/         # Feature modules (domain logic)
│  └─ <feature>/
│     ├─ components/ # Feature-specific UI
│     ├─ schemas/    # Zod schemas (source of truth)
│     ├─ services/   # API calls + TanStack Query hooks
│     └─ index.ts    # Public exports
├─ lib/              # Technical utilities
│  ├─ api.ts         # HTTP client (sole fetch abstraction)
│  ├─ tokenStorage.ts
│  └─ utils.ts
└─ main.tsx          # App entry point
```

## Strict Rules

- **No direct `fetch` calls** – Use `httpRequest` from `lib/api.ts`
- **No API calls in pages** – Use `features/<feature>/services`
- **No business logic in `components/ui/`**
- **Always validate API responses** with Zod schemas
- **Use TanStack Query** for all server state

## API Proxy (Vite)

In dev, Vite rewrites `/api/*` → backend `/api/v1/*`

**Frontend paths are written WITHOUT `/v1`:**
- ✅ `/auth/me` → proxied to `/api/v1/auth/me`
- ❌ `/api/v1/auth/me`

## HTTP Client (`lib/api.ts`)

```typescript
httpRequest<TOut>({
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,              // e.g., "/themes/public" (no /v1)
  params?: Record<string, string | number | boolean | null | undefined>,
  body?: unknown,
  withAuth?: boolean,        // default: true
  responseSchema?: ZodSchema // runtime validation
})
```

- Sends `credentials: "include"` for httpOnly refresh cookie
- Auto-refreshes on 401 via `POST /auth/refresh`

## Zod Schemas (`features/<feature>/schemas/`)

```typescript
export const ThemeSchema = z.object({ ... });
export type Theme = z.infer<typeof ThemeSchema>;
```

- Source of truth for API contracts
- Always use `responseSchema` in services

## Adding New Features

1. Create `src/features/<feature>/` with:
   - `components/`, `schemas/`, `services/`, `index.ts`
2. Add page in `src/pages/<Feature>Page.tsx`
3. Register route in `src/app/router.tsx`

## Protected Routes

- Use `<ProtectedRoute />` for auth-required routes
- Use `<ProtectedRoute requireAdmin />` for admin-only

## Code Style

- TypeScript strict mode
- No comments unless complex logic
- Use path alias `@/` for src imports
- Follow existing patterns in neighboring files
