import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Character, CharacterFilters, CharacterListResponse } from '../models/character.model';

@Injectable({ providedIn: 'root' })
export class CharactersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/character`;

  getCharacters(filters: CharacterFilters = {}): Observable<CharacterListResponse> {
    const params: Record<string, string> = { page: String(filters.page ?? 1) };
    if (filters.name) params['name'] = filters.name;
    if (filters.status) params['status'] = filters.status;
    if (filters.gender) params['gender'] = filters.gender;
    return this.http.get<CharacterListResponse>(this.apiUrl, { params });
  }

  getCharacterById(id: number): Observable<Character> {
    return this.http.get<Character>(`${this.apiUrl}/${id}`);
  }
}
