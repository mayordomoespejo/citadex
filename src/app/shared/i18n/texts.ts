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

  // ── Favorites page ─────────────────────────────────────────────────────────
  HEADER_NAV_FAVORITES: 'Favorites',
  FAVORITES_PAGE_TITLE: 'Favorites',
  FAVORITES_PAGE_EMPTY_TITLE: 'No favorites yet',
  FAVORITES_PAGE_EMPTY_MESSAGE: 'Start exploring characters and add them to your favorites.',
  FAVORITES_PAGE_EMPTY_CTA: 'Browse characters',
  FAVORITES_PAGE_ERROR: 'Could not load some favorites. Please try again.',

  // ── Episode list (character detail) ────────────────────────────────────────
  DETAIL_EPISODES_SECTION_TITLE: 'Episodes',
  DETAIL_EPISODES_SHOW_ALL: 'Show all episodes',
  DETAIL_EPISODES_SHOW_LESS: 'Show less',

  // ── Filter chips (characters page) ────────────────────────────────────────
  CHARACTERS_SEARCH_CLEAR_ARIA: 'Clear search',
  CHARACTERS_FILTERS_CLEAR_ALL: 'Clear all',
  CHARACTERS_FILTER_CHIP_NAME: 'Name',
  CHARACTERS_FILTER_CHIP_STATUS: 'Status',
  CHARACTERS_FILTER_CHIP_GENDER: 'Gender',

  // ── Not found page ─────────────────────────────────────────────────────────
  NOT_FOUND_CODE: '404',
  NOT_FOUND_TITLE: 'Page not found',
  NOT_FOUND_MESSAGE: "The page you're looking for doesn't exist.",
  NOT_FOUND_BACK_LINK: 'Back to characters',

  // ── Auth — Login page ───────────────────────────────────────────────────────
  LOGIN_TITLE: 'Bienvenido',
  LOGIN_SUBTITLE: 'Inicia sesión o crea una cuenta para continuar.',
  LOGIN_EMAIL_LABEL: 'Correo electrónico',
  LOGIN_EMAIL_PLACEHOLDER: 'tu@correo.com',
  LOGIN_PASSWORD_LABEL: 'Contraseña',
  LOGIN_PASSWORD_PLACEHOLDER: '••••••••',
  LOGIN_PASSWORD_SHOW: 'Mostrar contraseña',
  LOGIN_PASSWORD_HIDE: 'Ocultar contraseña',
  LOGIN_SUBMIT: 'Continuar',
  LOGIN_GOOGLE: 'Continuar con Google',
  LOGIN_ERROR_EMAIL_INVALID: 'Introduce un correo electrónico válido.',
  LOGIN_ERROR_PASSWORD_REQUIRED: 'La contraseña no puede estar vacía.',
  LOGIN_ERROR_WRONG_PASSWORD: 'Contraseña incorrecta.',
  LOGIN_ERROR_USER_NOT_FOUND: 'No existe una cuenta con ese correo.',
  LOGIN_ERROR_TOO_MANY_REQUESTS: 'Demasiados intentos. Inténtalo más tarde.',
  LOGIN_ERROR_GENERIC: 'Algo fue mal. Por favor, inténtalo de nuevo.',
  LOGIN_DIVIDER: 'o',

  // ── Auth — Header ───────────────────────────────────────────────────────────
  HEADER_NAV_LOGIN: 'Login',
  HEADER_NAV_PROFILE: 'Perfil',

  // ── Auth — Profile page ─────────────────────────────────────────────────────
  PROFILE_TITLE: 'Perfil',
  PROFILE_FAVORITES_COUNT: 'favoritos',
  PROFILE_SIGN_OUT: 'Cerrar sesión',
  PROFILE_DELETE_ACCOUNT: 'Eliminar cuenta',
  PROFILE_DELETE_CONFIRM_TITLE: '¿Eliminar cuenta?',
  PROFILE_DELETE_CONFIRM_MESSAGE: 'Esta acción es irreversible. Se eliminarán tu cuenta y todos tus favoritos.',
  PROFILE_DELETE_CONFIRM_CTA: 'Sí, eliminar',
  PROFILE_DELETE_CANCEL: 'Cancelar',
  PROFILE_DELETE_REAUTH_MESSAGE: 'Por seguridad, necesitamos que te autentiques de nuevo.',

  // ── Auth errors ───────────────────────────────────────────────────────────
  AUTH_ERROR_INVALID_EMAIL: 'Introduce un correo electrónico válido.',
  AUTH_ERROR_INVALID_CREDENTIAL: 'Contraseña incorrecta.',
  AUTH_ERROR_USER_NOT_FOUND: 'No existe una cuenta con ese correo.',
  AUTH_ERROR_TOO_MANY_REQUESTS: 'Demasiados intentos. Inténtalo más tarde.',
  AUTH_ERROR_POPUP_BLOCKED: 'El popup fue bloqueado. Permite popups para este sitio.',
  AUTH_ERROR_NETWORK_REQUEST_FAILED: 'Error de red. Comprueba tu conexión.',

  // ── Episode loading error ──────────────────────────────────────────────────
  DETAIL_EPISODES_LOAD_ERROR: 'Could not load episodes.',

  // ── Favorites sync error ───────────────────────────────────────────────────
  FAVORITES_SYNC_ERROR: 'Failed to sync favorites.',
} as const;
