import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { User, getIdToken } from 'firebase/auth';

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

  /** Last sync error message, or null if the last operation succeeded. */
  readonly error = signal<string | null>(null);

  constructor() {
    if (!environment.supabaseUrl) {
      console.error('SUPABASE_URL is not configured in environment.ts')
    }
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

  /**
   * Fetches the authenticated user's favorites from the Supabase Edge Function and replaces
   * the local signal with the result. Called automatically whenever the user signs in via
   * the reactive `effect` in the constructor.
   */
  async loadFavorites(): Promise<void> {
    const user = this.authService.user();
    if (!user) return;

    const res = await this.fetchWithRetry(ENDPOINT, {});

    if (!res.ok) {
      this.error.set('Failed to sync favorites.');
      return;
    }

    this.error.set(null);
    const rows: FavoriteRow[] = await res.json();
    const map = new Map<number, Character>();
    for (const row of rows) {
      const char = row.character_data;
      map.set(char.id, char);
    }
    this._favorites.set(map);
  }

  /**
   * Adds a character to favorites using an optimistic update: the signal is updated immediately
   * so the UI responds without delay, then the change is persisted to Supabase. If the server
   * request fails, the signal is rolled back to its previous state.
   */
  private async addFavorite(character: Character): Promise<void> {
    // Optimistic update
    const next = new Map(this._favorites());
    next.set(character.id, character);
    this._favorites.set(next);

    const body = JSON.stringify({
      character_id: String(character.id),
      character_data: character,
    });

    const res = await this.fetchWithRetry(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (!res.ok) {
      this.error.set('Failed to sync favorites.');
      // Rollback on failure
      const rollback = new Map(this._favorites());
      rollback.delete(character.id);
      this._favorites.set(rollback);
    } else {
      this.error.set(null);
    }
  }

  /**
   * Removes a character from favorites using an optimistic update: the entry is deleted from
   * the signal immediately, then the deletion is confirmed with Supabase. If the server request
   * fails, the character is restored to the signal.
   */
  private async removeFavorite(id: number): Promise<void> {
    // Optimistic update
    const saved = this._favorites().get(id);
    const next = new Map(this._favorites());
    next.delete(id);
    this._favorites.set(next);

    const res = await this.fetchWithRetry(`${ENDPOINT}?character_id=${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      this.error.set('Failed to sync favorites.');
      if (saved) {
        // Rollback on failure
        const rollback = new Map(this._favorites());
        rollback.set(id, saved);
        this._favorites.set(rollback);
      }
    } else {
      this.error.set(null);
    }
  }

  /**
   * Wraps `fetch` with automatic Firebase Bearer token injection. If the server responds with
   * 401, the token is force-refreshed and the request is retried once before returning the
   * final response.
   */
  private async fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
    let token = await this.getToken();
    const makeHeaders = (t: string): HeadersInit => ({
      ...(init.headers as Record<string, string>),
      Authorization: `Bearer ${t}`,
    });

    let res = await fetch(url, { ...init, headers: makeHeaders(token ?? '') });

    if (res.status === 401) {
      token = await this.getToken(true);
      if (token) {
        res = await fetch(url, { ...init, headers: makeHeaders(token) });
      }
    }

    return res;
  }

  private async getToken(forceRefresh = false): Promise<string | null> {
    const user = this.authService.user();
    if (!user) return null;
    try {
      return await getIdToken(user as User, forceRefresh);
    } catch {
      return null;
    }
  }
}
