# Citadex

A Rick & Morty character explorer built with Angular 21. Browse, filter, search and save your favourite characters from the multiverse.

**Live data** from the [Rick & Morty API](https://rickandmortyapi.com/).

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Angular 21 — standalone components, signals, `inject()` |
| Styles | SCSS + BEM + CSS custom properties (design tokens) |
| HTTP | `HttpClient` with `withFetch()`, reactive pipelines |
| Routing | Angular Router — lazy-loaded feature routes, custom `TitleStrategy` |
| Forms | Reactive Forms (`FormControl`, `FormGroup`) |
| Tests | Vitest + Angular TestBed + `HttpTestingController` |
| Linting / Format | ESLint + Prettier |

---

## Architecture

```
src/app/
├── core/                        # App-wide singletons (TitleStrategy)
├── features/
│   ├── home/                    # Landing page + HomeService (stats)
│   └── characters/              # Characters feature (lazy-loaded)
│       ├── components/          # CharacterCard
│       ├── models/              # Character, CharactersResponse interfaces
│       ├── pages/               # CharactersPage, CharacterDetailPage
│       └── services/            # CharactersService, FavoritesService
├── layout/
│   └── header/                  # Fixed app header with active-link nav
└── shared/
    ├── components/select/       # Accessible custom select (ControlValueAccessor)
    ├── i18n/texts.ts            # Centralised UI copy (no i18n library needed)
    └── pages/not-found/         # 404 fallback page
```

### Key patterns

- **URL as source of truth** — search, filters and page are stored in query params. The URL is always shareable and bookmarkable.
- **Reactive pipeline** — `queryParamMap` → `switchMap` → HTTP → signals → template. `catchError` inside `switchMap` keeps the stream alive after 404s.
- **CSS stagger animation** — card grid entrance uses a `--card-index` CSS custom property set from the `@for` loop index, driving `animation-delay` in pure CSS (`@keyframes card-enter`). No `@angular/animations` dependency.
- **Design tokens** — all colours, spacing, typography and transitions live in `src/styles/_variables.scss` as CSS custom properties, consumed throughout the app.

---

## Commands

```bash
# Development server (http://localhost:4200)
ng serve

# Production build (output: dist/)
ng build

# Unit tests (watch mode)
ng test

# Unit tests (single run, CI)
ng test --watch=false
```

---

## Features

- **Home** — hero with live universe stats (characters, episodes, locations)
- **Characters list** — paginated grid with debounced search and status/gender filters
- **Character detail** — full profile: image, status, species, origin, last known location, episode count
- **Favourites** — toggle favourite on any card or detail page; persisted in `localStorage`
- **404 page** — friendly fallback for unknown routes
- **Dynamic page titles** — each route updates `<title>` via a custom `TitleStrategy`
