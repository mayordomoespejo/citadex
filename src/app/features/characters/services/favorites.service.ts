import { Injectable, effect, signal } from '@angular/core';

/**
 * Manages the user's favorite character IDs.
 * State is persisted to `localStorage` and reactively tracked via signals.
 */
@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly storageKey = 'citadex-favorites';
  private readonly favoriteIds = signal<Set<number>>(this.loadFromStorage());

  constructor() {
    effect(() => {
      localStorage.setItem(this.storageKey, JSON.stringify([...this.favoriteIds()]));
    });
  }

  /** Returns `true` if the given character ID is in the favorites list. */
  isFavorite(id: number): boolean {
    return this.favoriteIds().has(id);
  }

  /** Adds the ID to favorites if absent, removes it if present. */
  toggle(id: number): void {
    const next = new Set(this.favoriteIds());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.favoriteIds.set(next);
  }

  private loadFromStorage(): Set<number> {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? new Set<number>(JSON.parse(stored)) : new Set<number>();
  }
}
