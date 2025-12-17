# Architecture du projet – Frontend React

## Contexte technique

- **Framework :** React + TypeScript
- **Bundler :** Vite
- **Routing :** react-router-dom
- **Gestion des requêtes HTTP & cache serveur :** TanStack Query (React Query)
- **UI / Design System :** shadcn/ui (composants headless stylés, basés sur Radix UI)

## Architecture : orientée features métiers + composants UI partagés

```
/ (racine)
├─ public/                      # Assets servis tels quels (sans bundling)
│  ├─ logo_detoure.png
│  └─ vite.svg
│
├─ src/                         # Code applicatif (React + TS)
│  ├─ app/                      # Wiring / config application (routing, providers, etc.)
│  │  └─ router.tsx             # Déclaration des routes + mapping route → page
│  │
│  ├─ assets/                   # Assets importés par le code (bundlés par Vite)
│  │  └─ logo_detoure.png
│  │
│  ├─ components/               # Composants partagés (UI générique + layout)
│  │  └─ ui/                    # Design system (importé depuis shadcn/ui)
│  │     ├─ badge.tsx
│  │     ├─ button.tsx
│  │     ├─ card.tsx
│  │     ├─ navigation-menu.tsx
│  │     ├─ scroll-area.tsx
│  │     ├─ sheet.tsx
│  │     └─ typography.tsx
│  │  └─ custom/                # composants UI globales et réutilisables
│  │     └─ navbar.tsx          # Navbar “app-level” (layout/navigation)
│  │
│  ├─ features/                 # “Feature modules” = logique métier par domaine
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
│  │  ├─ api.ts                 # Client API / wrapper fetch/axios, config endpoints, etc.
│  │  └─ utils.ts               # Helpers génériques (format, classes, etc.)
│  │
│  ├─ pages/                    # Pages (routes) = écrans de l’application
│  │  ├─ AboutPage.tsx
│  │  ├─ CreateGamePage.tsx
│  │  ├─ GamePage.tsx
│  │  └─ HomePage.tsx
│  │
│  ├─ index.css                 # Styles globaux (base CSS, tokens, reset, etc.)
│  └─ main.tsx                  # Point d’entrée React (mount App + router)
│
├─ .env                         # Variables d’environnement (Vite) — non commit si sensible
├─ index.html                   # Template Vite
├─ components.json              # Config UI (souvent shadcn/ui)
├─ vite.config.ts               # Config bundler Vite
├─ tsconfig*.json               # Config TypeScript
├─ eslint.config.js             # Lint
├─ package.json / lock          # Dépendances + scripts
└─ README.md
```

## Rôles et responsabilités par couche

`app/`
- Centralise la configuration globale
- Déclare les routes avec react-router-dom
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
    - `schemas/` → types + validation des données
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
    - client HTTP
    - helpers génériques
    - utilitaires de formatage

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
      → Schémas/types feature (src/features/<feature>/schemas/*)
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
- Routing : react-router-dom
- Data fetching & cache serveur : TanStack Query (React Query)
- UI components : shadcn/ui

ARCHITECTURE À RESPECTER (OBLIGATOIRE)
- Le projet est organisé par FEATURES MÉTIER.
- Les pages (src/pages) ne contiennent PAS de logique métier ni d’appels API directs.
- Toute interaction avec le backend passe par :
  src/features/<feature>/services (hooks TanStack Query).
- Les données sont typées et validées dans :
  src/features/<feature>/schemas.
- Les composants UI génériques utilisent shadcn/ui et vivent dans :
  src/components/ui.
- Les composants spécifiques à un domaine vivent dans :
  src/features/<feature>/components.
- Les outils techniques transverses (client HTTP, helpers) vivent dans :
  src/lib.
- Chaque feature expose ses éléments publics via un index.ts.

ARBORESCENCE LOGIQUE
src/
├─ app/            → routing uniquement
├─ pages/          → écrans / routes
├─ components/ui/  → design system (shadcn/ui)
├─ features/
│  └─ <feature>/
│     ├─ components/
│     ├─ schemas/
│     ├─ services/
│     └─ index.ts
├─ lib/
└─ main.tsx

RÈGLES STRICTES
- ❌ Aucun appel API direct dans les pages
- ❌ Aucun code métier dans components/ui
- ✅ Utiliser TanStack Query pour toute requête
- ✅ Créer les fichiers manquants si nécessaire
- ✅ Proposer une structure claire et cohérente
- ✅ Respecter le nommage existant et TypeScript strict

OBJECTIF
[Décris ici précisément la fonctionnalité à ajouter ou la modification à effectuer]

SORTIE ATTENDUE
- Liste des fichiers à créer ou modifier
- Contenu complet des nouveaux fichiers
- Modifications ciblées et justifiées
- Aucun code hors du périmètre demandé
```