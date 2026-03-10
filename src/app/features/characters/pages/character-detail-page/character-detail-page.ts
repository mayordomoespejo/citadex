import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CharactersService } from '../../services/characters.service';
import { FavoritesService } from '../../services/favorites.service';
import { Character } from '../../models/character.model';
import { TEXTS } from '../../../../shared/i18n/texts';

/**
 * Displays the full profile of a single character.
 * Dynamically updates the browser tab title with the character's name
 * since the route title is static and cannot reflect dynamic data.
 */
@Component({
  selector: 'app-character-detail-page',
  imports: [RouterLink],
  templateUrl: './character-detail-page.html',
  styleUrl: './character-detail-page.scss',
})
export class CharacterDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly charactersService = inject(CharactersService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly titleService = inject(Title);

  protected readonly T = TEXTS;

  protected readonly character = signal<Character | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly isFavorite = computed(() => {
    const c = this.character();
    return c ? this.favoritesService.isFavorite(c.id) : false;
  });

  protected toggleFavorite(): void {
    const c = this.character();
    if (c) this.favoritesService.toggle(c.id);
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.charactersService
      .getCharacterById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (character) => {
          this.character.set(character);
          this.titleService.setTitle(`${character.name} | Citadex`);
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set(TEXTS.DETAIL_NOT_FOUND_ERROR);
          this.isLoading.set(false);
        },
      });
  }
}
