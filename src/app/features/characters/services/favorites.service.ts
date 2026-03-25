import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { getIdToken } from 'firebase/auth';

import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/auth.service';
import { Character } from '../models/character.model';

const ENDPOINT = `${environment.supabaseUrl}/functions/v1/citadex-favorites`;

interface FavoriteRow {
  character_id: string;
  character_data: Character;
  created_at: string;
}

/**
 * Manages the user's favorite characters via a Supabase Edge Function.
 * Authentication is handled with a Firebase ID token.
 * No localStorage fallback — the user must be authenticated to use this service.
 */
@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly authService = inject(AuthService);

  private readonly _favorites = signal<Map<number, Character>>(new Map());

  /** Set of favorited character IDs — kept for efficient isFavorite checks. */
  readonly favoriteIds = computed(() => new Set(this._favorites().keys()));

  /** Ordered list of favorited characters for display purposes. */
  readonly favorites = computed(() => Array.from(this._favorites().values()));

  constructor() {
    // Auto-load favorites whenever the user signs in
    effect(() => {
      const user = this.authService.user();
      if (user) {
        this.loadFavorites();
      } else {
        this._favorites.set(new Map());
      }
    });
  }

  /** Returns `true` if the given character ID is currently favorited. */
  isFavorite(id: number): boolean {
    return this._favorites().has(id);
  }

  /** Adds or removes a character from favorites. */
  async toggleFavorite(character: Character): Promise<void> {
    if (this.isFavorite(character.id)) {
      await this.removeFavorite(character.id);
    } else {
      await this.addFavorite(character);
    }
  }

  /** Clears the local favorites state (used before account deletion). */
  clearFavorites(): void {
    this._favorites.set(new Map());
  }

  /** Fetches the user's favorites from Supabase and populates the signal. */
  async loadFavorites(): Promise<void> {
    const token = await this.getToken();
    if (!token) return;

    const res = await fetch(ENDPOINT, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return;

    const rows: FavoriteRow[] = await res.json();
    const map = new Map<number, Character>();
    for (const row of rows) {
      const char = row.character_data;
      map.set(char.id, char);
    }
    this._favorites.set(map);
  }

  private async addFavorite(character: Character): Promise<void> {
    const token = await this.getToken();
    if (!token) return;

    // Optimistic update
    const next = new Map(this._favorites());
    next.set(character.id, character);
    this._favorites.set(next);

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        character_id: String(character.id),
        character_data: character,
      }),
    });

    if (!res.ok) {
      // Rollback on failure
      const rollback = new Map(this._favorites());
      rollback.delete(character.id);
      this._favorites.set(rollback);
    }
  }

  private async removeFavorite(id: number): Promise<void> {
    const token = await this.getToken();
    if (!token) return;

    // Optimistic update
    const saved = this._favorites().get(id);
    const next = new Map(this._favorites());
    next.delete(id);
    this._favorites.set(next);

    const res = await fetch(`${ENDPOINT}?character_id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok && saved) {
      // Rollback on failure
      const rollback = new Map(this._favorites());
      rollback.set(id, saved);
      this._favorites.set(rollback);
    }
  }

  private async getToken(): Promise<string | null> {
    const user = this.authService.user();
    if (!user) return null;
    try {
      return await getIdToken(user);
    } catch {
      return null;
    }
  }
}
