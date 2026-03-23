import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { Character, CharacterFilters, CharacterListResponse, Episode } from '../models/character.model';

/**
 * Data-access service for the Rick & Morty characters API.
 * All HTTP calls related to characters should go through this service.
 */
@Injectable({ providedIn: 'root' })
export class CharactersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/character`;

  /**
   * Returns a paginated, filterable list of characters.
   * Empty-string filter values are omitted from the request params.
   */
  getCharacters(filters: CharacterFilters = {}): Observable<CharacterListResponse> {
    const params: Record<string, string> = { page: String(filters.page ?? 1) };
    if (filters.name) params['name'] = filters.name;
    if (filters.status) params['status'] = filters.status;
    if (filters.gender) params['gender'] = filters.gender;
    return this.http.get<CharacterListResponse>(this.apiUrl, { params });
  }

  /** Fetches a single character by its numeric ID. */
  getCharacterById(id: number): Observable<Character> {
    return this.http.get<Character>(`${this.apiUrl}/${id}`);
  }

  /**
   * Fetches episode details for a list of episode URLs.
   * Returns an empty array if no URLs are provided.
   * Individual failed requests are silently omitted from the result.
   */
  getEpisodesByUrls(urls: string[]): Observable<Episode[]> {
    if (urls.length === 0) return of([]);
    const requests = urls.map((url) =>
      this.http.get<Episode>(url).pipe(catchError(() => of(null))),
    );
    return new Observable<Episode[]>((observer) => {
      forkJoin(requests).subscribe({
        next: (results) => {
          observer.next(results.filter((e): e is Episode => e !== null));
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }
}
