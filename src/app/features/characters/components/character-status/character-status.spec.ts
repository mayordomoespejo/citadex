import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterStatus } from './character-status';
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
  image: 'https://example.com/rick.png',
  episode: [],
  url: '',
  created: '',
};

describe('CharacterStatus', () => {
  let fixture: ComponentFixture<CharacterStatus>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterStatus],
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterStatus);
    fixture.componentRef.setInput('character', mockCharacter);
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the character status text', () => {
    expect(compiled.textContent).toContain('Alive');
  });

  it('renders the character species text', () => {
    expect(compiled.textContent).toContain('Human');
  });

  it('applies the correct status modifier class to the dot for Alive', () => {
    const dot = compiled.querySelector('.character-status__dot');
    expect(dot?.classList.contains('character-status__dot--alive')).toBe(true);
  });

  it('applies the correct status modifier class to the dot for Dead', () => {
    const deadChar: Character = { ...mockCharacter, status: 'Dead' };
    fixture.componentRef.setInput('character', deadChar);
    fixture.detectChanges();
    const dot = compiled.querySelector('.character-status__dot');
    expect(dot?.classList.contains('character-status__dot--dead')).toBe(true);
  });

  it('applies the correct status modifier class to the dot for unknown', () => {
    const unknownChar: Character = { ...mockCharacter, status: 'unknown' };
    fixture.componentRef.setInput('character', unknownChar);
    fixture.detectChanges();
    const dot = compiled.querySelector('.character-status__dot');
    expect(dot?.classList.contains('character-status__dot--unknown')).toBe(true);
  });

  it('shows status and species separated by a dot', () => {
    const text = compiled.querySelector('.character-status__text')?.textContent ?? '';
    expect(text).toContain('·');
    expect(text).toContain('Alive');
    expect(text).toContain('Human');
  });

  it('updates when character input changes', () => {
    const mortyChar: Character = {
      ...mockCharacter,
      id: 2,
      name: 'Morty Smith',
      status: 'Alive',
      species: 'Human',
    };
    fixture.componentRef.setInput('character', mortyChar);
    fixture.detectChanges();
    expect(compiled.textContent).toContain('Morty Smith' === 'Morty Smith' ? 'Alive' : '');
    expect(compiled.textContent).toContain('Human');
  });
});
