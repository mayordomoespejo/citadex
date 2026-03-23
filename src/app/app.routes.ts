import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Home',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'characters',
    loadChildren: () =>
      import('./features/characters/characters.routes').then((m) => m.CHARACTERS_ROUTES),
  },
  {
    path: 'favorites',
    title: 'Favorites',
    loadComponent: () =>
      import('./features/characters/pages/favorites-page/favorites-page').then(
        (m) => m.FavoritesPage,
      ),
  },
  {
    path: '**',
    title: 'Page not found',
    loadComponent: () =>
      import('./shared/pages/not-found/not-found').then((m) => m.NotFound),
  },
];
