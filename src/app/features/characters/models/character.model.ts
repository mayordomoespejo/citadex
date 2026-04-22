/** Vitality status as returned by the Rick & Morty API. */
export type CharacterStatus = 'Alive' | 'Dead' | 'unknown';

/** Biological gender as returned by the Rick & Morty API. */
export type CharacterGender = 'Female' | 'Male' | 'Genderless' | 'unknown';

/** Represents a location reference returned by the Rick & Morty API, containing the location's display name and a URL pointing to its full resource data. */
export interface CharacterLocation {
  name: string;
  url: string;
}

/** Maps directly to a character object returned by the Rick & Morty API, including identity, status, species, gender, origin, current location, image, and episode appearances. */
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

/** Represents the pagination metadata returned by the API on every list response, including total item count, total pages, and next/prev page URLs. */
export interface ApiInfo {
  count: number;
  pages: number;
  next: string | null;
  prev: string | null;
}

/** The full paginated response wrapper returned by the characters list endpoint, combining pagination metadata with the array of character results. */
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

/** A single episode resource from the Rick & Morty API. */
export interface Episode {
  id: number;
  name: string;
  air_date: string;
  /** Episode code in the format S01E01. */
  episode: string;
}
