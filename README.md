# Citadex

Rick and Morty character explorer. Browse, search, filter and save favourite characters from the multiverse using live data from the Rick and Morty API.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 — standalone components, signals, `inject()` |
| Styles | SCSS, BEM, CSS custom properties |
| HTTP | `HttpClient` with `withFetch()`, reactive pipelines |
| Routing | Angular Router — lazy-loaded feature routes, custom `TitleStrategy` |
| Forms | Reactive Forms (`FormControl`, `FormGroup`) |
| Auth | Firebase Authentication — email/password + Google OAuth |
| Favorites storage | Supabase Edge Function (`citadex-favorites`), table `citadex_favorites` |
| Tests | Vitest, Angular TestBed, `HttpTestingController` |
| Linting / Format | ESLint, Prettier |

---

## Demo

https://citadex.vercel.app

---

## Features

- Home page with live universe stats: total characters, episodes and locations
- Paginated character grid with debounced search and status/gender filters
- Character detail page with full profile: image, status, species, origin, last known location and episode count
- Favourite toggle on any card or detail page, synced to Supabase per-user
- Dedicated `/favorites` page — reactive grid that updates instantly on toggle
- Episode list on character detail: code, name and air date with show-all toggle
- Active filter chips below the search bar with individual dismiss and clear-all button
- Skeleton loaders on character list and detail page while data is fetching
- URL as source of truth — search, filters and page stored in query params, fully shareable and bookmarkable
- CSS stagger animation on card grid entrance driven by a `--card-index` custom property, no `@angular/animations` required
- Dynamic page titles via a custom `TitleStrategy` on every route
- 404 fallback page for unknown routes
- Auth-required routes — all routes except `/login` require a valid session
- Smart auth form — single form that signs up or signs in depending on whether the email exists
- Google sign-in via popup
- Profile page with avatar, display name, favourites count, sign-out and account deletion

---

## Project structure

```
src/app/
├── core/                  # App-wide singletons
│   ├── auth/              # AuthService, authGuard
│   └── firebase/          # Firebase app initialisation and config
├── features/              # Vertical slices, one per domain
│   ├── auth/
│   │   ├── login/         # Login page component
│   │   └── profile/       # Profile page component
│   ├── characters/        # Characters feature
│   │   ├── components/    # CharacterCard and other presentational components
│   │   ├── models/        # TypeScript interfaces (Character, ApiResponse, …)
│   │   ├── pages/         # CharactersPage, CharacterDetailPage, FavoritesPage
│   │   ├── services/      # CharactersService, FavoritesService
│   │   └── characters.routes.ts
│   └── home/              # Home page with universe stats
├── shared/                # Cross-feature primitives
│   ├── components/        # Reusable UI components (Select, …)
│   ├── i18n/              # Static UI strings / text constants
│   └── pages/             # NotFound page
├── layout/
│   └── header/            # App shell header component
├── app.routes.ts          # Root route table
├── app.config.ts          # Angular application config (providers)
└── core/
    └── app-title.strategy.ts  # Custom TitleStrategy
```

**Rules:**

- `core/` — injectable singletons provided at the root level. No UI components live here.
- `features/` — each feature owns its routes, pages, components, services and models. Features do not import from sibling features.
- `shared/` — stateless, reusable primitives. No feature-specific business logic.
- `layout/` — structural shell components (header, footer) that wrap the routed content.

---

## Auth flow

Authentication is handled by Firebase and wired into Angular via signals.

**`AuthService` (`core/auth/auth.service.ts`)**

- Exposes a `user` signal (`User | null`) populated by Firebase's `onAuthStateChanged` listener, which is started once from the app root via `authService.init()`.
- Exposes a `loading` signal that is `true` until the first auth-state event arrives. This prevents a flash of unauthenticated content on page load.
- Exposes `isAuthenticated` as a computed signal derived from `user`.

**Smart sign-in / sign-up form (`features/auth/login/`)**

- A single email + password form handles both new and returning users.
- On submit, `AuthService.smartAuth()` attempts `createUserWithEmailAndPassword`. If Firebase returns `auth/email-already-in-use`, it falls back to `signInWithEmailAndPassword` automatically. The user never sees separate sign-in / sign-up screens.
- Google sign-in is available as a secondary option and uses `signInWithPopup`.

**Auth guard (`core/auth/auth.guard.ts`)**

- Implemented as a functional `CanActivateFn` and applied to every route except `/login`.
- The guard waits for `loading` to become `false` before evaluating the session (using `toObservable` + `filter`), so it never blocks or redirects based on an incomplete auth check.
- Unauthenticated navigations are redirected to `/login`.

---

## Environment variables

Angular uses `src/environments/environment.ts` for build-time configuration (not `.env` files).

Fill in the following values before running the app locally:

```ts
// src/environments/environment.ts
export const environment = {
  apiBaseUrl: 'https://rickandmortyapi.com/api',
  firebase: {
    apiKey: 'YOUR_FIREBASE_API_KEY',
    authDomain: 'YOUR_PROJECT.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT.appspot.com',
    messagingSenderId: 'YOUR_SENDER_ID',
    appId: 'YOUR_APP_ID',
  },
  supabaseUrl: 'https://YOUR_SUPABASE_PROJECT.supabase.co',
};
```

For the Supabase Edge Function, set the following secrets via `supabase secrets set`:
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (automatically available in Edge Functions)
- Update `FIREBASE_PROJECT_ID` placeholder in `supabase/functions/_shared/firebaseAuth.ts` with your real Citadex Firebase project ID.

---

## Supabase Edge Function

The favorites backend runs as a Deno Edge Function at `supabase/functions/citadex-favorites/`.

**Deploy**

```bash
supabase functions deploy citadex-favorites
```

The function requires the Supabase CLI to be installed and linked to your project (`supabase login` + `supabase link`).

**How it works**

- Every request must carry a Firebase ID token in the `Authorization: Bearer <token>` header.
- The function verifies the token against Firebase's public keys via `supabase/functions/_shared/firebaseAuth.ts`.
- Authenticated requests are routed by HTTP method:
  - `GET` — returns all favourites for the authenticated user.
  - `POST` — adds a character ID to the user's favourites.
  - `DELETE` — removes a character ID from the user's favourites.
- CORS preflight (`OPTIONS`) is handled explicitly; the allowed origin is controlled by the `ALLOWED_ORIGIN` environment secret (defaults to `*`).

**Secrets required in Supabase**

| Secret | Description |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Available automatically in the Edge Function runtime |
| `ALLOWED_ORIGIN` | Restrict CORS to your deployed domain (optional; defaults to `*`) |

---

## Getting started

```bash
npm install
```

```bash
ng serve
```

Open http://localhost:4200 in your browser.

---

## Scripts

| Command | Description |
|---|---|
| `ng serve` | Start development server at localhost:4200 |
| `ng build` | Production build, output to `dist/` |
| `ng test` | Run unit tests in watch mode |
| `ng test --watch=false` | Run unit tests once (CI) |

---

## Contributing

### Code style

Format is enforced by Prettier (`printWidth: 100`, `singleQuote: true`). Run before committing:

```bash
npx prettier --write .
```

### Commit conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

feat(characters): add episode count to detail page
fix(auth): prevent redirect flash before auth state resolves
refactor(favorites): simplify toggle signal logic
chore: update Angular to 21.3
```

Common types: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `style`, `perf`.

### Pull requests

- Branch from `main`. Use a descriptive branch name that matches the commit type: `feat/`, `fix/`, `chore/`, etc.
- Keep PRs focused — one logical change per PR.
- All tests must pass (`ng test --watch=false`) before requesting review.
- Include a brief description of what changed and why. Screenshots are welcome for UI changes.

---

## License

MIT
