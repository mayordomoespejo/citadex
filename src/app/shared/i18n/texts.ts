export const TEXTS = {
  // ── Common ─────────────────────────────────────────────────────────────────
  // Reutilizado en characters-page y character-detail-page
  COMMON_LOADING: 'Loading…',
  // Reutilizado en character-card y character-detail-page
  COMMON_FAVORITE_ADD_ARIA: 'Add to favorites',
  COMMON_FAVORITE_REMOVE_ARIA: 'Remove from favorites',
  // Reutilizado en character-card (footer) y character-detail-page (facts)
  COMMON_LAST_KNOWN_LOCATION: 'Last known location',

  // ── Header ─────────────────────────────────────────────────────────────────
  HEADER_LOGO_ALT: 'Rick and Morty',
  HEADER_NAV_CHARACTERS: 'Characters',

  // ── Home ───────────────────────────────────────────────────────────────────
  HOME_TITLE_PREFIX: 'Explore the',
  HOME_TITLE_HIGHLIGHT: 'multiverse',
  HOME_SUBTITLE: 'Every character, every dimension. Browse, search and filter the full Rick & Morty universe.',
  HOME_CTA_LABEL: 'Browse characters',
  HOME_STAT_CHARACTERS_LABEL: 'Characters',
  HOME_STAT_EPISODES_LABEL: 'Episodes',
  HOME_STAT_LOCATIONS_LABEL: 'Locations',

  // ── Characters page ────────────────────────────────────────────────────────
  CHARACTERS_PAGE_TITLE: 'Characters',
  CHARACTERS_PAGE_RESULTS_SUFFIX: 'results',
  CHARACTERS_PAGE_SEARCH_PLACEHOLDER: 'Search by name…',
  CHARACTERS_PAGE_EMPTY: 'No characters found for your search.',
  CHARACTERS_PAGE_ERROR: 'Could not load characters. Please try again.',
  CHARACTERS_PAGE_PAGINATION_PREV: '← Previous',
  CHARACTERS_PAGE_PAGINATION_NEXT: 'Next →',
  CHARACTERS_PAGE_PAGINATION_PAGE: 'Page',
  CHARACTERS_PAGE_PAGINATION_OF: 'of',

  // ── Characters filters (select options) ───────────────────────────────────
  CHARACTERS_FILTER_STATUS_ALL: 'All statuses',
  CHARACTERS_FILTER_STATUS_ALIVE: 'Alive',
  CHARACTERS_FILTER_STATUS_DEAD: 'Dead',
  CHARACTERS_FILTER_STATUS_UNKNOWN: 'Unknown',
  CHARACTERS_FILTER_GENDER_ALL: 'All genders',
  CHARACTERS_FILTER_GENDER_FEMALE: 'Female',
  CHARACTERS_FILTER_GENDER_MALE: 'Male',
  CHARACTERS_FILTER_GENDER_GENDERLESS: 'Genderless',
  CHARACTERS_FILTER_GENDER_UNKNOWN: 'Unknown',

  // ── Character detail page ──────────────────────────────────────────────────
  DETAIL_BACK_LINK: '← Back to characters',
  DETAIL_NOT_FOUND_ERROR: 'Character not found.',
  DETAIL_FACT_GENDER: 'Gender',
  DETAIL_FACT_TYPE: 'Type',
  DETAIL_FACT_ORIGIN: 'Origin',
  DETAIL_FACT_LOCATION: 'Last known location',
  DETAIL_FACT_EPISODES: 'Episodes',

  // ── Not found page ─────────────────────────────────────────────────────────
  NOT_FOUND_CODE: '404',
  NOT_FOUND_TITLE: 'Page not found',
  NOT_FOUND_MESSAGE: "The page you're looking for doesn't exist.",
  NOT_FOUND_BACK_LINK: 'Back to characters',
} as const;
