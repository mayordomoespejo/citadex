import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';

import { environment } from '../../../environments/environment';

/** Aggregated universe stats shown in the home page hero section. */
export interface HomeStats {
  characters: number;
  episodes: number;
  locations: number;
}

interface CountResponse {
  info: { count: number };
}

/**
 * Data-access service for the home feature.
 * Fetches universe-wide stats from the Rick & Morty API in parallel.
 */
@Injectable({ providedIn: 'root' })
export class HomeService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  /** Returns total counts for characters, episodes and locations in a single emission. */
  getStats(): Observable<HomeStats> {
    return forkJoin({
      characters: this.http.get<CountResponse>(`${this.base}/character`),
      episodes: this.http.get<CountResponse>(`${this.base}/episode`),
      locations: this.http.get<CountResponse>(`${this.base}/location`),
    }).pipe(
      map((res) => ({
        characters: res.characters.info.count,
        episodes: res.episodes.info.count,
        locations: res.locations.info.count,
      })),
    );
  }
}
