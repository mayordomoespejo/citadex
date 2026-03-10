import { Injectable, effect, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly storageKey = 'citadex-favorites';

  private readonly favoriteIds = signal<Set<number>>(this.loadFromStorage());

  constructor() {
    // Persiste en localStorage cada vez que favoriteIds cambia
    effect(() => {
      localStorage.setItem(this.storageKey, JSON.stringify([...this.favoriteIds()]));
    });
  }

  isFavorite(id: number): boolean {
    return this.favoriteIds().has(id);
  }

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
