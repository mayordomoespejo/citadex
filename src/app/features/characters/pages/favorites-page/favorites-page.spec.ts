import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

import { FavoritesPage } from './favorites-page';
import { FavoritesService } from '../../services/favorites.service';
import { Character } from '../../models/character.model';

const mockCharacter: Character = {
  id: 1,
  name: 'Rick Sanchez',
  status: 'Alive',
  species: 'Human',
  type: '',
  gender: 'Male',
  origin: { name: 'Earth', url: '' },
  location: { name: 'Earth', url: '' },
  image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
  episode: [],
  url: '',
  created: '',
};

function createMockFavoritesService(
  favorites: Character[] = [],
  error: string | null = null,
) {
  return {
    isFavorite: vi.fn().mockReturnValue(favorites.length > 0),
    toggleFavorite: vi.fn().mockResolvedValue(undefined),
    favorites: signal(favorites),
    favoriteIds: signal(new Set(favorites.map((c) => c.id))),
    error: signal(error),
  };
}

async function createFixture(favoritesService: ReturnType<typeof createMockFavoritesService>) {
  await TestBed.configureTestingModule({
    imports: [FavoritesPage],
    providers: [
      provideRouter([]),
      { provide: FavoritesService, useValue: favoritesService },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(FavoritesPage);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return { fixture, compiled: fixture.nativeElement as HTMLElement };
}

describe('FavoritesPage', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', async () => {
    const { fixture } = await createFixture(createMockFavoritesService());
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders page title', async () => {
    const { compiled } = await createFixture(createMockFavoritesService());
    expect(compiled.textContent).toContain('Favorites');
  });

  it('shows empty state when no favorites', async () => {
    const { compiled } = await createFixture(createMockFavoritesService([]));
    expect(compiled.querySelector('.favorites-page__empty')).toBeTruthy();
  });

  it('empty state contains CTA link to /characters', async () => {
    const { compiled } = await createFixture(createMockFavoritesService([]));
    const cta = compiled.querySelector<HTMLAnchorElement>('.favorites-page__empty-cta');
    expect(cta?.getAttribute('href')).toBe('/characters');
  });

  it('empty state title is rendered', async () => {
    const { compiled } = await createFixture(createMockFavoritesService([]));
    expect(compiled.textContent).toContain('No favorites yet');
  });

  it('renders character cards when favorites exist', async () => {
    const { compiled } = await createFixture(createMockFavoritesService([mockCharacter]));
    expect(compiled.querySelectorAll('app-character-card').length).toBe(1);
  });

  it('shows count when favorites exist', async () => {
    const { compiled } = await createFixture(createMockFavoritesService([mockCharacter]));
    expect(compiled.textContent).toContain('1');
  });

  it('renders error message from service error signal', async () => {
    const { compiled } = await createFixture(
      createMockFavoritesService([], 'Could not load some favorites. Please try again.'),
    );
    expect(compiled.querySelector('.favorites-page__error')).toBeTruthy();
    expect(compiled.textContent).toContain('Could not load some favorites');
  });

  it('no error element when error signal is null', async () => {
    const { compiled } = await createFixture(createMockFavoritesService([], null));
    expect(compiled.querySelector('.favorites-page__error')).toBeNull();
  });

  it('grid is not rendered in empty state', async () => {
    const { compiled } = await createFixture(createMockFavoritesService([]));
    expect(compiled.querySelector('.favorites-page__grid')).toBeNull();
  });
});
