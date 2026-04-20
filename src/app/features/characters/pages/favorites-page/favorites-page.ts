import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FavoritesService } from '../../services/favorites.service';
import { CharacterCard } from '../../components/character-card/character-card';
import { PageLayout } from '../../../../shared/components/page-layout/page-layout';
import { TEXTS } from '../../../../shared/i18n/texts';

@Component({
  selector: 'app-favorites-page',
  imports: [CharacterCard, RouterLink, PageLayout],
  templateUrl: './favorites-page.html',
  styleUrl: './favorites-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Displays the authenticated user's favorited characters by reading directly from
 * `FavoritesService`. Uses OnPush change detection since all state is signal-based.
 */
export class FavoritesPage {
  private readonly favoritesService = inject(FavoritesService);

  protected readonly T = TEXTS;
  protected readonly error = this.favoritesService.error;
  protected readonly characters = this.favoritesService.favorites;
}
