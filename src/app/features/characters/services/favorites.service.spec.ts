import { describe, it, expect, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';

// Mock firebase/auth (non-relative — allowed by Angular unit-test runner)
vi.mock('firebase/auth', () => ({
  getIdToken: vi.fn(),
  onAuthStateChanged: vi.fn(() => vi.fn()),
  getAuth: vi.fn(() => ({})),
}));

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

import * as firebaseAuth from 'firebase/auth';
import { FavoritesService } from './favorites.service';
import { AuthService } from '../../../core/auth/auth.service';
import { environment } from '../../../../environments/environment';
import { Character } from '../models/character.model';

const ENDPOINT = environment.favoritesEndpoint;

const mockCharacter: Character = {
  id: 1,
  name: 'Rick Sanchez',
  status: 'Alive',
  species: 'Human',
  type: '',
  gender: 'Male',
  origin: { name: 'Earth', url: '' },
  location: { name: 'Earth', url: '' },
  image: 'https://example.com/rick.png',
  episode: [],
  url: '',
  created: '',
};

const mockUser = { uid: 'user-123' };
const emptyRows: never[] = [];
const singleRow = [{ character_id: '1', character_data: mockCharacter, created_at: '2024-01-01' }];

/** Flush pending microtasks so async operations (e.g. getIdToken) complete before we check the HTTP queue. */
function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/** Sets up TestBed with user signal starting as null so the constructor effect doesn't fire. */
function setup() {
  const userSignal = signal<typeof mockUser | null>(null);

  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      {
        provide: AuthService,
        useValue: { user: userSignal },
      },
    ],
  });

  const service = TestBed.inject(FavoritesService);
  const httpMock = TestBed.inject(HttpTestingController);

  return { service, httpMock, userSignal };
}

describe('FavoritesService', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
  });

  describe('loadFavorites()', () => {
    it('populates favorites signal from API response', async () => {
      vi.mocked(firebaseAuth.getIdToken).mockResolvedValue('token-abc');
      const { service, httpMock, userSignal } = setup();
      userSignal.set(mockUser as never);

      const promise = service.loadFavorites();

      // Allow getIdToken promise to resolve so the HTTP request is enqueued
      await flushMicrotasks();

      // Flush all pending GET requests (manual call + possible effect-triggered call)
      httpMock.match(ENDPOINT).forEach((r) => r.flush(singleRow));

      await promise;

      expect(service.favorites()).toHaveLength(1);
      expect(service.favorites()[0].id).toBe(1);
      expect(service.favoriteIds().has(1)).toBe(true);
      expect(service.error()).toBeNull();

      // Drain any lingering effect requests
      httpMock.match(ENDPOINT).forEach((r) => r.flush(singleRow));
      httpMock.verify();
    });

    it('sets error signal when load fails', async () => {
      vi.mocked(firebaseAuth.getIdToken).mockResolvedValue('token-abc');
      const { service, httpMock, userSignal } = setup();
      userSignal.set(mockUser as never);

      const promise = service.loadFavorites();

      await flushMicrotasks();

      // Flush ALL pending requests with errors so the error signal stays set
      httpMock.match(ENDPOINT).forEach((r) =>
        r.flush('Server error', { status: 500, statusText: 'Internal Server Error' }),
      );

      await promise;

      // Drain any additional effect-triggered requests with errors too
      await flushMicrotasks();
      httpMock.match(ENDPOINT).forEach((r) =>
        r.flush('Server error', { status: 500, statusText: 'Internal Server Error' }),
      );

      expect(service.error()).not.toBeNull();
      httpMock.verify();
    });
  });

  describe('401 retry', () => {
    it('refreshes token and retries on 401', async () => {
      vi.mocked(firebaseAuth.getIdToken)
        .mockResolvedValueOnce('stale-token')   // first attempt
        .mockResolvedValueOnce('fresh-token')   // retry after 401
        .mockResolvedValue('fresh-token');       // any effect-triggered calls

      const { service, httpMock, userSignal } = setup();
      userSignal.set(mockUser as never);

      const promise = service.loadFavorites();

      await flushMicrotasks();

      // Drain any effect-triggered requests first (they use 'fresh-token' from mock sequence)
      // Effect request fired before manual call gets through; drain with stale token first
      const allReqs = httpMock.match(ENDPOINT);

      // Find and flush the stale-token request with 401
      const staleReq = allReqs.find((r) => r.request.headers.get('Authorization') === 'Bearer stale-token');
      const otherReqs = allReqs.filter((r) => r !== staleReq);

      // If effect already fired with fresh token, drain it
      otherReqs.forEach((r) => r.flush(singleRow));

      // Flush manual call with 401
      if (staleReq) {
        staleReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

        // Allow the retry's getIdToken to resolve
        await flushMicrotasks();

        // Retry: fresh token
        httpMock.match(ENDPOINT).forEach((r) => r.flush(singleRow));
      }

      await promise;

      httpMock.match(ENDPOINT).forEach((r) => r.flush(singleRow));

      expect(service.favorites()).toHaveLength(1);
      expect(service.error()).toBeNull();
      httpMock.verify();
    });
  });

  describe('optimistic update rollback', () => {
    it('reverts addFavorite if POST fails', async () => {
      vi.mocked(firebaseAuth.getIdToken).mockResolvedValue('token-abc');
      const { service, httpMock, userSignal } = setup();
      userSignal.set(mockUser as never);

      // Drain any initial effect-triggered GET requests
      await flushMicrotasks();
      httpMock.match(ENDPOINT).forEach((r) => r.flush(emptyRows));

      expect(service.isFavorite(mockCharacter.id)).toBe(false);

      const promise = service.toggleFavorite(mockCharacter);

      // Optimistic update applied immediately (synchronous)
      expect(service.isFavorite(mockCharacter.id)).toBe(true);

      await flushMicrotasks();

      const req = httpMock.expectOne((r) => r.url === ENDPOINT && r.method === 'POST');
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      await promise;

      httpMock.match(ENDPOINT).forEach((r) => r.flush(emptyRows));

      // Rolled back after failure
      expect(service.isFavorite(mockCharacter.id)).toBe(false);
      expect(service.error()).not.toBeNull();
      httpMock.verify();
    });

    it('reverts removeFavorite if DELETE fails', async () => {
      vi.mocked(firebaseAuth.getIdToken).mockResolvedValue('token-abc');
      const { service, httpMock, userSignal } = setup();
      userSignal.set(mockUser as never);

      // Pre-populate favorites via loadFavorites
      const loadPromise = service.loadFavorites();
      await flushMicrotasks();
      httpMock.match(ENDPOINT).forEach((r) => r.flush(singleRow));
      await loadPromise;

      // Drain any lingering effect requests
      await flushMicrotasks();
      httpMock.match(ENDPOINT).forEach((r) => r.flush(singleRow));

      expect(service.isFavorite(mockCharacter.id)).toBe(true);

      const promise = service.toggleFavorite(mockCharacter);

      // Optimistic delete applied immediately
      expect(service.isFavorite(mockCharacter.id)).toBe(false);

      await flushMicrotasks();

      const req = httpMock.expectOne(`${ENDPOINT}?character_id=${mockCharacter.id}`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      await promise;

      // Drain any lingering effect requests
      await flushMicrotasks();
      httpMock.match(ENDPOINT).forEach((r) => r.flush(singleRow));

      // Rolled back after failure
      expect(service.isFavorite(mockCharacter.id)).toBe(true);
      expect(service.error()).not.toBeNull();
      httpMock.verify();
    });
  });
});
