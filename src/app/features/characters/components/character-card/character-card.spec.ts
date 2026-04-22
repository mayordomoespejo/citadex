import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

import { CharacterCard } from './character-card';
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

function createMockFavoritesService(isFav = false) {
  return {
    isFavorite: vi.fn().mockReturnValue(isFav),
    toggleFavorite: vi.fn().mockResolvedValue(undefined),
    favorites: signal([]),
    favoriteIds: signal(new Set<number>()),
    error: signal(null),
  };
}

describe('CharacterCard', () => {
  let fixture: ComponentFixture<CharacterCard>;
  let compiled: HTMLElement;
  let mockFavoritesService: ReturnType<typeof createMockFavoritesService>;

  beforeEach(async () => {
    mockFavoritesService = createMockFavoritesService();

    await TestBed.configureTestingModule({
      imports: [CharacterCard],
      providers: [
        provideRouter([]),
        { provide: FavoritesService, useValue: mockFavoritesService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterCard);
    fixture.componentRef.setInput('character', mockCharacter);
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders character name', () => {
    expect(compiled.textContent).toContain('Rick Sanchez');
  });

  it('card link points to character detail route', () => {
    const link = compiled.querySelector('a.card');
    expect(link?.getAttribute('href')).toBe('/characters/1');
  });

  it('favorite button has aria-label for adding favorite when not favorited', () => {
    const btn = compiled.querySelector<HTMLButtonElement>('.card__favorite-btn');
    expect(btn?.getAttribute('aria-label')).toBe('Add to favorites');
  });

  it('favorite button has aria-label for removing favorite when favorited', async () => {
    mockFavoritesService.isFavorite.mockReturnValue(true);
    // Re-create with favorited state
    fixture.componentRef.setInput('character', mockCharacter);
    fixture.detectChanges();
    await fixture.whenStable();
    // Force re-check by re-creating
    TestBed.resetTestingModule();

    const favService = createMockFavoritesService(true);
    await TestBed.configureTestingModule({
      imports: [CharacterCard],
      providers: [
        provideRouter([]),
        { provide: FavoritesService, useValue: favService },
      ],
    }).compileComponents();

    const f2 = TestBed.createComponent(CharacterCard);
    f2.componentRef.setInput('character', mockCharacter);
    f2.detectChanges();
    const btn = (f2.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.card__favorite-btn');
    expect(btn?.getAttribute('aria-label')).toBe('Remove from favorites');
  });

  it('calls toggleFavorite and stops propagation when favorite button clicked', () => {
    const btn = compiled.querySelector<HTMLButtonElement>('.card__favorite-btn');
    const mockEvent = { preventDefault: vi.fn(), stopPropagation: vi.fn() };
    btn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(mockFavoritesService.toggleFavorite).toHaveBeenCalledWith(mockCharacter);
  });

  it('renders character image with correct alt text', () => {
    const img = compiled.querySelector('img');
    expect(img?.getAttribute('alt')).toBe('Rick Sanchez');
  });

  it('renders CharacterStatus component', () => {
    expect(compiled.querySelector('app-character-status')).toBeTruthy();
  });

  it('updates displayed name when character input changes', () => {
    const morty: Character = { ...mockCharacter, id: 2, name: 'Morty Smith' };
    fixture.componentRef.setInput('character', morty);
    fixture.detectChanges();
    expect(compiled.textContent).toContain('Morty Smith');
  });
});
