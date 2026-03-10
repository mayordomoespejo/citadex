/** Vitality status as returned by the Rick & Morty API. */
export type CharacterStatus = 'Alive' | 'Dead' | 'unknown';

/** Biological gender as returned by the Rick & Morty API. */
export type CharacterGender = 'Female' | 'Male' | 'Genderless' | 'unknown';

/** A named location with its API resource URL. */
export interface CharacterLocation {
  name: string;
  url: string;
}

/** Full character resource from the Rick & Morty API. */
export interface Character {
  id: number;
  name: string;
  status: CharacterStatus;
  species: string;
  type: string;
  gender: CharacterGender;
  origin: CharacterLocation;
  location: CharacterLocation;
  image: string;
  /** URLs of the episodes this character appears in. */
  episode: string[];
  url: string;
  created: string;
}

/** Pagination metadata included in every list response. */
export interface ApiInfo {
  count: number;
  pages: number;
  next: string | null;
  prev: string | null;
}

/** Paginated character list response from the API. */
export interface CharacterListResponse {
  info: ApiInfo;
  results: Character[];
}

/** Query parameters accepted by the characters list endpoint. */
export interface CharacterFilters {
  name?: string;
  status?: string;
  gender?: string;
  page?: number;
}
