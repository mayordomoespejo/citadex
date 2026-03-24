import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { CharactersService } from '../../services/characters.service';
import { FavoritesService } from '../../services/favorites.service';
import { CharacterCard } from '../../components/character-card/character-card';
import { Character } from '../../models/character.model';
import { TEXTS } from '../../../../shared/i18n/texts';

@Component({
  selector: 'app-favorites-page',
  imports: [CharacterCard, RouterLink],
  templateUrl: './favorites-page.html',
  styleUrl: './favorites-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesPage implements OnInit {
  private readonly charactersService = inject(CharactersService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly T = TEXTS;
  protected readonly skeletonItems = Array(8).fill(null);

  // All characters ever loaded (cache)
  private readonly allCharacters = signal<Character[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);

  // Reactively filtered by current favorites — updates instantly on toggle
  protected readonly characters = computed(() => {
    const ids = this.favoritesService.favoriteIds();
    return this.allCharacters().filter((c) => ids.has(c.id));
  });

  ngOnInit(): void {
    const ids = [...this.favoritesService.favoriteIds()];

    if (ids.length === 0) {
      this.isLoading.set(false);
      return;
    }

    const requests = ids.map((id) =>
      this.charactersService.getCharacterById(id).pipe(
        catchError(() => of(null)),
      ),
    );

    forkJoin(requests)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((results) => {
        const loaded = results.filter((c): c is Character => c !== null);
        this.allCharacters.set(loaded);
        if (loaded.length < ids.length) {
          this.error.set(TEXTS.FAVORITES_PAGE_ERROR);
        }
        this.isLoading.set(false);
      });
  }
}
