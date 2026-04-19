import { vi } from 'vitest';

/** Mock IntersectionObserver for @defer (on viewport) in test environments */
(globalThis as Record<string, unknown>)['IntersectionObserver'] = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

/**
 * Global firebase mocks applied before any spec file loads.
 * Prevents duplicate vi.mock registrations across spec files.
 */
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(() => vi.fn()),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  signInWithPopup: vi.fn(),
  reauthenticateWithPopup: vi.fn(),
  GoogleAuthProvider: class {},
  getAuth: vi.fn(() => ({})),
  deleteUser: vi.fn().mockResolvedValue(undefined),
  getIdToken: vi.fn(),
}));
