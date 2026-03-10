import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Character } from '../../models/character.model';
import { FavoritesService } from '../../services/favorites.service';
import { TEXTS } from '../../../../shared/i18n/texts';

@Component({
  selector: 'app-character-card',
  imports: [RouterLink],
  templateUrl: './character-card.html',
  styleUrl: './character-card.scss',
})
export class CharacterCard {
  protected readonly T = TEXTS;

  character = input.required<Character>();

  private readonly favoritesService = inject(FavoritesService);

  isFavorite = computed(() => this.favoritesService.isFavorite(this.character().id));

  onFavoriteToggle(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.favoritesService.toggle(this.character().id);
  }
}
