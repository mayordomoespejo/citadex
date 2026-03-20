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
- Favourite toggle on any card or detail page, persisted in `localStorage`
- URL as source of truth — search, filters and page stored in query params, fully shareable and bookmarkable
- CSS stagger animation on card grid entrance driven by a `--card-index` custom property, no `@angular/animations` required
- Dynamic page titles via a custom `TitleStrategy` on every route
- 404 fallback page for unknown routes

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
