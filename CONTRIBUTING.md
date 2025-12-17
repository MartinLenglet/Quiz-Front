# Architecture du projet – Frontend React

## Contexte technique

- **Framework :** React + TypeScript
- **Bundler :** Vite
- **Routing :** react-router-dom
- **Gestion des requêtes HTTP & cache serveur :** TanStack Query (React Query)
- **UI / Design System :** shadcn/ui (composants headless stylés, basés sur Radix UI)
- **Validation runtime des données :** Zod

## Architecture : orientée features métiers + composants UI partagés

```
/ (racine)
├─ public/                      # Assets servis tels quels (sans bundling)
│
├─ src/                         # Code applicatif (React + TS)
│  ├─ app/                      # Wiring / config application (routing, providers, etc.)
│  │  └─ router.tsx             # Déclaration des routes + routes protégées + mapping route → page
│  │
│  ├─ assets/                   # Assets importés par le code (bundlés par Vite)
│  │
│  ├─ components/               # Composants partagés (UI générique + layout)
│  │  └─ ui/                    # Design system (importé depuis shadcn/ui)
│  │     ├─ badge.tsx
│  │     ├─ button.tsx
│  │     ├─ card.tsx
│  │     ├─ navigation-menu.tsx
│  │     ├─ scroll-area.tsx
│  │     ├─ ...
│  │  └─ custom/                # composants UI globales et réutilisables
│  │     └─ navbar.tsx          # Navbar “app-level” (layout/navigation) (auth-aware)
│  │
│  ├─ features/                 # “Feature modules” = logique métier par domaine
│  │  ├─ auth/                  # Domaine Authentification
│  │  │  ├─ components/         # ProtectedRoute, formulaires, etc.
│  │  │  ├─ schemas/            # Schémas Zod (contrats backend)
│  │  │  ├─ services/           # Appels API + hooks TanStack Query
│  │  │  └─ index.ts
│  │  └─ themes/                # Domaine: thèmes (ex: catégories, sections, etc.)
│  │     ├─ components/         # UI spécifique au domaine "themes"
│  │     │  ├─ CategoryRow.tsx
│  │     │  └─ NetflixSections.tsx
│  │     ├─ schemas/            # Types/validation/contrats (ex: Zod/Pydantic-like côté TS)
│  │     │  └─ theme.schema.ts
│  │     ├─ services/           # Accès aux données + hooks orientés domaine
│  │     │  ├─ theme.services.ts
│  │     │  ├─ usePublicThemes.ts
│  │     │  └─ index.ts         # Barrel export du feature (exports publics)
│  │     └─ (fichiers futurs)   # ex: utils.ts, constants.ts, etc.
│  │
│  ├─ lib/                      # Utilitaires techniques transverses (non-métier)
│  │  ├─ api.ts                 # Client HTTP unique (fetch + auth + refresh)
│  │  ├─ tokenStorage.ts        # Stockage access token (mémoire + localStorage)
│  │  └─ utils.ts               # Helpers génériques (format, classes, etc.)
│  │
│  ├─ pages/                    # Pages (routes) = écrans de l’application
│  │  ├─ AboutPage.tsx
│  │  ├─ CreateGamePage.tsx
│  │  ├─ GamePage.tsx
│  │  ├─ HomePage.tsx
│  │  └─ ...
│  │
│  ├─ index.css                 # Styles globaux (base CSS, tokens, reset, etc.)
│  └─ main.tsx                  # Point d’entrée React (mount App + router)
│
├─ .env                         # Variables d’environnement (Vite) — non commit si sensible
├─ index.html                   # Template Vite
├─ components.json              # Config UI (souvent shadcn/ui)
├─ vite.config.ts               # Config bundler Vite + Proxy API
├─ tsconfig*.json               # Config TypeScript
├─ eslint.config.js             # Lint
├─ package.json / lock          # Dépendances + scripts
└─ README.md
```

## Rôles et responsabilités par couche

`app/`
- Centralise la configuration globale
- Déclare les routes avec react-router-dom
- Applique les routes protégées via `ProtectedRoute`
- Ne contient pas de logique métier

`pages/`
- Représentent les écrans de l’application
- Connectées au router
- Orchestrent les features et composants
- Aucune logique d’accès API directe ici

`components/ui/`
- Composants shadcn/ui
- Réutilisables, non dépendants du métier
- Ne contiennent pas de logique métier ni d’appel API

`features/`
- Cœur fonctionnel de l’application
- Chaque feature est autonome et découplée
- Structure interne standardisée :
  - `components/` → UI spécifique au domaine
  - `schemas/` → Schémas Zod + types + validation des données
    - Source de vérité pour les données backend
    - Validation runtime + typage TypeScript (`z.infer`)
    - Alignés avec les modèles backend (Pydantic / OpenAPI)
  - `services/` → logique d’accès aux données (TanStack Query)
    - Contient 
        - Fonctions d’appel API
        - Hooks useQuery, useMutation, etc. (TanStack Query)
    - Centralise la logique serveur (cache, revalidation, erreurs)
  - `index.ts` → exports publics

`lib/`
- Outils techniques transverses
- Aucun lien direct avec le métier
- Exemples :
  - `lib/api.ts` : Client HTTP unique de l’application.
    - Responsabilités :
      - Centralise tous les appels `fetch`
      - Ajoute automatiquement :
        - `Authorization: Bearer <access_token>` si présent
        - `credentials: "include"` (cookie httpOnly pour refresh)
      - Gère le refresh automatique du token sur 401
      - Supporte :
        - `params` (query string)
        - `responseSchema` (validation Zod de la réponse)
    - **⚠️ Aucun appel direct à `fetch` ailleurs dans l’application.**

credentials: "include" (cookie httpOnly pour refresh)
  - helpers génériques
  - utilitaires de formatage

###  Proxy API (`vite.config.ts`)
```
server: {
  proxy: {
    "/api": {
      target: "http://localhost:8080",
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, "/api/v1"),
    },
  },
}
```
➡️ Côté frontend :
- les paths sont toujours sans `/v1`
- ex: `/auth/me`, `/themes/public`
- le proxy s’occupe du mapping vers `/api/v1`

## Authentification & routes protégées
- Les tokens sont gérés dans `lib/tokenStorage.ts`
- Le refresh token est stocké en **cookie httpOnly**
- `ProtectedRoute` :
  - bloque l’accès si non connecté
  - supporte les routes `admin-only`
- La redirection post-logout est gérée côté UI (`onSettled`)

## Règles simples : où modifier / où ajouter

### Ajouter une nouvelle page (nouvel écran / route)

- Créer un fichier dans : `src/pages/MonNouvelEcranPage.tsx`
- Déclarer la route dans : `src/app/router.tsx`
- Si la page utilise un domaine métier (ex: themes), elle consomme `src/features/<feature>/...`

### Ajouter un composant UI générique (bouton, carte, layout réutilisable)

- Si c’est un composant “design system” générique : `src/components/ui/`
- Si c’est un composant partagé mais pas “design system” (layout, navbar, wrappers) : `src/components/custom/`

### Ajouter une feature métier (nouveau domaine fonctionnel)

- Créer un dossier :
```
src/features/<nouvelle-feature>/
├─ components/
├─ schemas/
├─ services/
└─ index.ts
```
- Respecter la structure `components / schemas / services`
- Exporter via index.ts

### Ajouter / modifier un appel API (fetch, endpoints, client HTTP)

- Client et helpers techniques globaux : `src/lib/api.ts`
- Services par domaine : `src/features/<feature>/services/*.ts`
- Les données doivent idéalement être validées/typées via `src/features/<feature>/schemas/*.ts`

### Ajouter des assets

- Asset “statique pur” (servi tel quel, accessible par URL directe) : `public/`
- Asset importé dans le code React (bundlé) : `src/assets/`

## Flux logique recommandé (pour guider contributeurs et LLM)

```
Route react-router-dom (src/app/router.tsx)
   → Page (src/pages/*)
      → Composants partagés (src/components/*)
         + Composants feature (src/features/<feature>/components/*)
      → Hooks/services feature (src/features/<feature>/services/*) avec TanStack Query
         → Client API / helpers techniques (src/lib/api.ts, src/lib/utils.ts)
            → Interroge le backend
      → Schémas Zod/types feature (src/features/<feature>/schemas/*)
```

## Convention d’import (conseillée)

- Une page importe les features via leurs exports publics :
    - `import { usePublicThemes } from "@/features/themes"` (via `src/features/themes/services/index.ts` ou `src/features/themes/index.ts` selon votre barrel)
- Les pages ne devraient pas appeler `lib/api.ts` directement si la logique appartient à une feature : passer par `features/<feature>/services`.

## Version courte pour prompt LLM

```
Tu interviens sur un frontend React + TypeScript basé sur Vite.

STACK TECHNIQUE
- React + Vite
- Routing : react-router-dom (v6)
- Data fetching & cache serveur : TanStack Query (React Query)
- Validation runtime des données : Zod
- UI components : shadcn/ui

ARCHITECTURE À RESPECTER (OBLIGATOIRE)
- Le projet est organisé par FEATURES MÉTIER.
- Les pages (src/pages) ne contiennent PAS de logique métier ni d’appels API directs.
- Toute interaction avec le backend passe par : src/features/<feature>/services
- Le client HTTP unique est : src/lib/api.ts
  - Interdit d’utiliser fetch directement ailleurs.

PROXY VITE (IMPORTANT)
- En dev, Vite proxy rewrite :
  /api/*  -> backend /api/v1/*
- Donc côté front, les endpoints sont TOUJOURS écrits SANS "/v1"
  Exemple : path "/auth/me" (dev -> /api/auth/me -> proxy -> /api/v1/auth/me)

CLIENT HTTP (src/lib/api.ts)
- Utiliser la fonction `httpRequest` :
  httpRequest<TOut>({
    method: "GET"|"POST"|"PUT"|"PATCH"|"DELETE",
    path: string,              // ex: "/themes/public" (sans /v1)
    params?: Record<string, string|number|boolean|null|undefined>,
    body?: unknown,            // JSON sérialisé
    withAuth?: boolean,        // défaut true (Bearer access_token si présent)
    responseSchema?: zodSchema // validation runtime Zod
  })
- Le client envoie `credentials: "include"` pour supporter le refresh cookie httpOnly.
- Sur 401, il tente automatiquement POST "/auth/refresh" puis retry une fois.
- Les services doivent fournir `responseSchema` dès que possible.

ZOD (src/features/<feature>/schemas)
- Les schémas Zod sont la source de vérité côté front.
- Exporter : `XxxSchema` + `type Xxx = z.infer<typeof XxxSchema>`.
- Les services valident la réponse via `responseSchema`.

UI
- Les composants génériques shadcn/ui vivent dans src/components/ui (aucun métier).
- Les composants de domaine vivent dans src/features/<feature>/components.
- Les composants globaux de layout (Navbar, wrappers) vivent dans src/components/custom.

ROUTES PROTÉGÉES
- Les routes nécessitant une session utilisent <ProtectedRoute /> (feature auth).
- Support admin-only via <ProtectedRoute requireAdmin />.

EXEMPLE D’APPEL API (dans un service de feature)
- Schema (schemas/theme.schema.ts) :
  export const ThemeSchema = z.object({...})
- Service (services/theme.api.ts) :
  return httpRequest({
    method: "GET",
    path: "/themes/public",
    params,
    responseSchema: ThemeSchema.array(),
    withAuth: false
  })

ARBORESCENCE LOGIQUE
src/
├─ app/            → routing uniquement
├─ pages/          → écrans
├─ components/ui   → design system
├─ components/custom → layout / navbar
├─ features/
│  └─ <feature>/
│     ├─ components
│     ├─ schemas     (Zod)
│     ├─ services    (TanStack Query)
│     └─ index.ts
├─ lib/             → client HTTP + helpers
└─ main.tsx

RÈGLES STRICTES
- ❌ Aucun fetch direct hors lib/api.ts
- ❌ Aucun appel API dans les pages
- ❌ Aucun code métier dans components/ui
- ✅ Utiliser TanStack Query pour toute requête
- ✅ Valider les données avec Zod
- ✅ Respecter le proxy Vite (/api → /api/v1)
- ✅ Respecter TypeScript strict

OBJECTIF
[Décris ici précisément la fonctionnalité à ajouter ou la modification à effectuer]

SORTIE ATTENDUE
- Liste des fichiers à créer ou modifier
- Contenu complet des nouveaux fichiers
- Modifications ciblées et justifiées
- Aucun code hors du périmètre demandé
```