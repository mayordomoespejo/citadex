import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { AuthService, isFirebaseError, mapFirebaseError } from './auth.service';
import { FIREBASE_AUTH_ADAPTER } from '../firebase/firebase-auth.adapter';
import type { FirebaseAuthAdapter } from '../firebase/firebase-auth.adapter';

function createMockAdapter(): FirebaseAuthAdapter {
  return {
    onAuthStateChanged: vi.fn(() => vi.fn()),
    createUserWithEmailAndPassword: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    signInWithPopup: vi.fn(),
    reauthenticateWithPopup: vi.fn(),
    signOut: vi.fn(),
    getIdToken: vi.fn(),
    deleteUser: vi.fn().mockResolvedValue(undefined),
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let adapter: FirebaseAuthAdapter;

  beforeEach(() => {
    adapter = createMockAdapter();

    TestBed.configureTestingModule({
      providers: [{ provide: FIREBASE_AUTH_ADAPTER, useValue: adapter }],
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
  });

  describe('init()', () => {
    it('registers onAuthStateChanged listener', () => {
      service.init();
      expect(adapter.onAuthStateChanged).toHaveBeenCalledOnce();
    });

    it('updates user signal when auth state changes to a logged-in user', () => {
      const mockUser = { uid: 'user-123', email: 'test@example.com' } as never;
      vi.mocked(adapter.onAuthStateChanged).mockImplementation((callback) => {
        callback(mockUser);
        return vi.fn();
      });

      service.init();

      expect(service.user()).toBe(mockUser);
      expect(service.loading()).toBe(false);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('sets user to null and loading to false when signed out', () => {
      vi.mocked(adapter.onAuthStateChanged).mockImplementation((callback) => {
        callback(null);
        return vi.fn();
      });

      service.init();

      expect(service.user()).toBeNull();
      expect(service.loading()).toBe(false);
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('smartAuth()', () => {
    it('calls createUserWithEmailAndPassword for new account', async () => {
      vi.mocked(adapter.createUserWithEmailAndPassword).mockResolvedValue(undefined);

      await service.smartAuth('new@example.com', 'password123');

      expect(adapter.createUserWithEmailAndPassword).toHaveBeenCalledOnce();
      expect(adapter.signInWithEmailAndPassword).not.toHaveBeenCalled();
    });

    it('falls back to signIn when email is already in use', async () => {
      vi.mocked(adapter.createUserWithEmailAndPassword).mockRejectedValue({
        code: 'auth/email-already-in-use',
      });
      vi.mocked(adapter.signInWithEmailAndPassword).mockResolvedValue(undefined);

      await service.smartAuth('existing@example.com', 'password123');

      expect(adapter.signInWithEmailAndPassword).toHaveBeenCalledOnce();
    });

    it('re-throws non-email-already-in-use errors', async () => {
      const error = { code: 'auth/network-request-failed' };
      vi.mocked(adapter.createUserWithEmailAndPassword).mockRejectedValue(error);

      await expect(service.smartAuth('test@example.com', 'pass')).rejects.toEqual(error);
      expect(adapter.signInWithEmailAndPassword).not.toHaveBeenCalled();
    });
  });

  describe('signOut()', () => {
    it('calls Firebase signOut', async () => {
      vi.mocked(adapter.signOut).mockResolvedValue(undefined);

      await service.signOut();

      expect(adapter.signOut).toHaveBeenCalledOnce();
    });
  });
});

describe('isFirebaseError()', () => {
  it('returns true for objects with a code property', () => {
    expect(isFirebaseError({ code: 'auth/user-not-found' })).toBe(true);
  });

  it('returns false for non-objects', () => {
    expect(isFirebaseError('string')).toBe(false);
    expect(isFirebaseError(null)).toBe(false);
    expect(isFirebaseError(42)).toBe(false);
  });

  it('returns false for objects without code property', () => {
    expect(isFirebaseError({ message: 'error' })).toBe(false);
  });
});

describe('mapFirebaseError()', () => {
  it('maps known auth error codes to messages', () => {
    expect(mapFirebaseError({ code: 'auth/invalid-email' }, 'fallback')).not.toBe('fallback');
    expect(mapFirebaseError({ code: 'auth/wrong-password' }, 'fallback')).not.toBe('fallback');
    expect(mapFirebaseError({ code: 'auth/user-not-found' }, 'fallback')).not.toBe('fallback');
  });

  it('returns fallback for unknown codes', () => {
    expect(mapFirebaseError({ code: 'auth/unknown-code' }, 'fallback message')).toBe('fallback message');
  });

  it('returns fallback for non-Firebase errors', () => {
    expect(mapFirebaseError(new Error('generic'), 'fallback message')).toBe('fallback message');
  });
});
