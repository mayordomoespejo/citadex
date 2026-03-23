import { Routes } from '@angular/router';

export const CHARACTERS_ROUTES: Routes = [
  {
    path: '',
    title: 'Characters',
    loadComponent: () =>
      import('./pages/characters-page/characters-page').then((m) => m.CharactersPage),
  },
  {
    path: 'favorites',
    title: 'Favorites',
    loadComponent: () =>
      import('./pages/favorites-page/favorites-page').then((m) => m.FavoritesPage),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/character-detail-page/character-detail-page').then(
        (m) => m.CharacterDetailPage,
      ),
  },
];
