import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Character } from '../../models/character.model';
import { FavoritesService } from '../../services/favorites.service';
import { TEXTS } from '../../../../shared/i18n/texts';
import { CharacterStatus } from '../character-status/character-status';

/** Presentational card component that displays a single character in the grid and navigates to the detail page on click. */
@Component({
  selector: 'app-character-card',
  imports: [RouterLink, CharacterStatus],
  templateUrl: './character-card.html',
  styleUrl: './character-card.scss',
})
export class CharacterCard {
  /** Required input that drives the entire card display — image, name, status, and routing. */
  readonly character = input.required<Character>();

  private readonly favoritesService = inject(FavoritesService);

  protected readonly T = TEXTS;
  /** Computed signal that reflects whether this character is currently in the user's favorites list. */
  protected readonly isFavorite = computed(() =>
    this.favoritesService.isFavorite(this.character().id),
  );

  /** Toggles the favorite state of the character, preventing the click from bubbling to the card's router link. */
  protected onFavoriteToggle(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    void this.favoritesService.toggleFavorite(this.character());
  }
}
