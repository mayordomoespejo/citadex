import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
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
export class FavoritesPage {
  private readonly favoritesService = inject(FavoritesService);

  protected readonly T = TEXTS;
  protected readonly skeletonItems = Array(8).fill(null);

  // Read error directly from the service so the template reflects real state
  protected readonly error = this.favoritesService.error;

  // Characters come directly from the service's in-memory favorites map
  protected readonly characters = this.favoritesService.favorites;

  protected readonly isLoading = signal(false);
}
