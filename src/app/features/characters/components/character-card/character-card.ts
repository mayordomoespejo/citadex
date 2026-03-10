import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Character } from '../../models/character.model';
import { FavoritesService } from '../../services/favorites.service';
import { TEXTS } from '../../../../shared/i18n/texts';

/**
 * Card component representing a single character in the grid.
 * Navigates to the character detail page on click.
 */
@Component({
  selector: 'app-character-card',
  imports: [RouterLink],
  templateUrl: './character-card.html',
  styleUrl: './character-card.scss',
})
export class CharacterCard {
  /** The character data to display. */
  readonly character = input.required<Character>();

  private readonly favoritesService = inject(FavoritesService);

  protected readonly T = TEXTS;
  protected readonly isFavorite = computed(() =>
    this.favoritesService.isFavorite(this.character().id),
  );

  protected onFavoriteToggle(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.favoritesService.toggle(this.character().id);
  }
}
