import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { Title } from '@angular/platform-browser';

import { CharacterDetailPage } from './character-detail-page';
import { CharactersService } from '../../services/characters.service';
import { FavoritesService } from '../../services/favorites.service';
import { Character, Episode } from '../../models/character.model';

const mockCharacter: Character = {
  id: 42,
  name: 'Rick Sanchez',
  status: 'Alive',
  species: 'Human',
  type: '',
  gender: 'Male',
  origin: { name: 'Earth (C-137)', url: '' },
  location: { name: 'Citadel of Ricks', url: '' },
  image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
  episode: ['https://rickandmortyapi.com/api/episode/1'],
  url: '',
  created: '',
};

const mockEpisodes: Episode[] = [
  { id: 1, name: 'Pilot', air_date: 'December 2, 2013', episode: 'S01E01' },
];

function createMockCharactersService(character: Character = mockCharacter, episodes: Episode[] = mockEpisodes) {
  return {
    getCharacterById: vi.fn().mockReturnValue(of(character)),
    getEpisodesByUrls: vi.fn().mockReturnValue(of(episodes)),
    getCharacters: vi.fn(),
  };
}

function createMockFavoritesService(isFav = false) {
  return {
    isFavorite: vi.fn().mockReturnValue(isFav),
    toggleFavorite: vi.fn().mockResolvedValue(undefined),
    favorites: signal<Character[]>([]),
    favoriteIds: signal(new Set<number>()),
    error: signal(null),
  };
}

async function createFixture(
  options: {
    charactersService?: ReturnType<typeof createMockCharactersService>;
    favoritesService?: ReturnType<typeof createMockFavoritesService>;
    paramId?: string;
  } = {},
) {
  const {
    charactersService = createMockCharactersService(),
    favoritesService = createMockFavoritesService(),
    paramId = '42',
  } = options;

  await TestBed.configureTestingModule({
    imports: [CharacterDetailPage],
    providers: [
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: { paramMap: { get: vi.fn().mockReturnValue(paramId) } },
        },
      },
      { provide: CharactersService, useValue: charactersService },
      { provide: FavoritesService, useValue: favoritesService },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(CharacterDetailPage);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return { fixture, compiled: fixture.nativeElement as HTMLElement, charactersService, favoritesService };
}

describe('CharacterDetailPage', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', async () => {
    const { fixture } = await createFixture();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('fetches character by ID from route param', async () => {
    const { charactersService } = await createFixture();
    expect(charactersService.getCharacterById).toHaveBeenCalledWith(42);
  });

  it('renders character name after loading', async () => {
    const { compiled } = await createFixture();
    expect(compiled.textContent).toContain('Rick Sanchez');
  });

  it('renders CharacterStatus component', async () => {
    const { compiled } = await createFixture();
    expect(compiled.querySelector('app-character-status')).toBeTruthy();
  });

  it('renders gender fact', async () => {
    const { compiled } = await createFixture();
    expect(compiled.textContent).toContain('Male');
  });

  it('renders origin fact', async () => {
    const { compiled } = await createFixture();
    expect(compiled.textContent).toContain('Earth (C-137)');
  });

  it('sets document title with character name', async () => {
    await createFixture();
    const titleService = TestBed.inject(Title);
    expect(titleService.getTitle()).toBe('Rick Sanchez | Citadex');
  });

  it('favorite button has aria-label when not favorited', async () => {
    const { compiled } = await createFixture();
    const btn = compiled.querySelector<HTMLButtonElement>('.detail-page__favorite-btn');
    expect(btn?.getAttribute('aria-label')).toBe('Add to favorites');
  });

  it('favorite button has aria-label when favorited', async () => {
    const favService = createMockFavoritesService(true);
    const { compiled } = await createFixture({ favoritesService: favService });
    const btn = compiled.querySelector<HTMLButtonElement>('.detail-page__favorite-btn');
    expect(btn?.getAttribute('aria-label')).toBe('Remove from favorites');
  });

  it('calls toggleFavorite when favorite button clicked', async () => {
    const { compiled, favoritesService } = await createFixture();
    const btn = compiled.querySelector<HTMLButtonElement>('.detail-page__favorite-btn');
    btn?.click();
    expect(favoritesService.toggleFavorite).toHaveBeenCalledWith(mockCharacter);
  });

  it('shows error state when character load fails', async () => {
    const errorService = {
      ...createMockCharactersService(),
      getCharacterById: vi.fn().mockReturnValue(throwError(() => new Error('Not found'))),
    };
    const { compiled } = await createFixture({ charactersService: errorService });
    const retryBtn = compiled.querySelector<HTMLButtonElement>('.detail-page__retry-btn');
    expect(retryBtn).toBeTruthy();
    expect(retryBtn?.getAttribute('aria-label')).toBe('Retry loading');
    expect(compiled.textContent).toContain('Character not found');
  });

  it('retry button calls onRetry which reloads character', async () => {
    const errorService = {
      getCharacterById: vi.fn()
        .mockReturnValueOnce(throwError(() => new Error('fail')))
        .mockReturnValue(of(mockCharacter)),
      getEpisodesByUrls: vi.fn().mockReturnValue(of(mockEpisodes)),
      getCharacters: vi.fn(),
    };
    const { fixture, compiled } = await createFixture({ charactersService: errorService });
    const retryBtn = compiled.querySelector<HTMLButtonElement>('.detail-page__retry-btn');
    retryBtn?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(errorService.getCharacterById).toHaveBeenCalledTimes(2);
  });

  it('back link navigates to /characters', async () => {
    const { compiled } = await createFixture();
    const backLink = compiled.querySelector<HTMLAnchorElement>('.detail-page__back');
    expect(backLink?.getAttribute('href')).toBe('/characters');
  });
});
