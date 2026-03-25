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

See `.env.example` at the project root for a reference of the required values.

For the Supabase Edge Function, set the following secrets via `supabase secrets set`:
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (automatically available in Edge Functions)
- Update `FIREBASE_PROJECT_ID` placeholder in `supabase/functions/_shared/firebaseAuth.ts` with your real Citadex Firebase project ID.

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

## License

MIT
