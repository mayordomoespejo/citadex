import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { FavoritesService } from '../../services/favorites.service';
import { CharacterCard } from '../../components/character-card/character-card';
import { TEXTS } from '../../../../shared/i18n/texts';

@Component({
  selector: 'app-favorites-page',
  imports: [CharacterCard, RouterLink],
  templateUrl: './favorites-page.html',
  styleUrl: './favorites-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesPage {
  private readonly favoritesService = inject(FavoritesService);

  protected readonly T = TEXTS;
  protected readonly skeletonItems = Array(8).fill(null);

  protected readonly isLoading = signal(false);
  protected readonly error = signal<string | null>(null);

  // Characters come directly from the service's in-memory favorites map
  protected readonly characters = this.favoritesService.favorites;
}
