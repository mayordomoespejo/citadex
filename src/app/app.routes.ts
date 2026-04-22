import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';

/**
 * Application route table. All feature routes use `loadComponent` / `loadChildren` for
 * lazy loading, and every protected route is gated by `authGuard`, which waits for the
 * Firebase auth state before allowing or redirecting the navigation.
 */
export const routes: Routes = [
  {
    path: 'login',
    title: 'Login',
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: '',
    title: 'Home',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'characters',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/characters/characters.routes').then((m) => m.CHARACTERS_ROUTES),
  },
  {
    path: 'favorites',
    title: 'Favorites',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/characters/pages/favorites-page/favorites-page').then(
        (m) => m.FavoritesPage,
      ),
  },
  {
    path: 'profile',
    title: 'Profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/auth/profile/profile').then((m) => m.Profile),
  },
  {
    path: '**',
    title: 'Page not found',
    loadComponent: () =>
      import('./shared/pages/not-found/not-found').then((m) => m.NotFound),
  },
];
