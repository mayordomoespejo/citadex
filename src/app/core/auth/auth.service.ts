import { Injectable, OnDestroy, computed, inject, signal } from '@angular/core';
import type { User } from 'firebase/auth';

import { FIREBASE_AUTH_ADAPTER } from '../firebase/firebase-auth.adapter';
import { TEXTS } from '../../shared/i18n/texts';

/**
 * Returns true if the given error is a Firebase error object with a `code` property.
 */
export function isFirebaseError(err: unknown): err is { code: string } {
  return typeof err === 'object' && err !== null && 'code' in err;
}

/**
 * Maps a Firebase auth error code to a user-facing Spanish message.
 * Returns `fallback` for unrecognized codes or non-Firebase errors.
 */
export function mapFirebaseError(err: unknown, fallback: string): string {
  if (isFirebaseError(err)) {
    switch (err.code) {
      case 'auth/invalid-email':
        return TEXTS.AUTH_ERROR_INVALID_EMAIL;
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return TEXTS.AUTH_ERROR_INVALID_CREDENTIAL;
      case 'auth/user-not-found':
        return TEXTS.AUTH_ERROR_USER_NOT_FOUND;
      case 'auth/too-many-requests':
        return TEXTS.AUTH_ERROR_TOO_MANY_REQUESTS;
      case 'auth/popup-blocked':
        return TEXTS.AUTH_ERROR_POPUP_BLOCKED;
      case 'auth/network-request-failed':
        return TEXTS.AUTH_ERROR_NETWORK_REQUEST_FAILED;
      default:
        return fallback;
    }
  }
  return fallback;
}

/**
 * Singleton service that manages Firebase authentication state.
 * Exposes reactive signals (`user`, `loading`, `isAuthenticated`) and methods for
 * email/password sign-up, sign-in, Google OAuth, sign-out, re-authentication, and token retrieval.
 * All Firebase SDK calls are delegated to the injected `FirebaseAuthAdapter`, making this
 * service fully testable without module-level mocks.
 */
@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {
  private readonly fb = inject(FIREBASE_AUTH_ADAPTER);

  readonly user = signal<User | null>(null);
  readonly loading = signal(true);
  readonly isAuthenticated = computed(() => !!this.user());

  private unsubscribeAuth: (() => void) | null = null;

  /** Must be called once from the app root to start listening to auth state. */
  init(): void {
    this.unsubscribeAuth = this.fb.onAuthStateChanged((user) => {
      this.user.set(user);
      this.loading.set(false);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAuth?.();
  }

  signInWithEmail(email: string, password: string): Promise<void> {
    return this.fb.signInWithEmailAndPassword(email, password);
  }

  signUpWithEmail(email: string, password: string): Promise<void> {
    return this.fb.createUserWithEmailAndPassword(email, password);
  }

  /**
   * Tries to create the account; if the email is already in use, signs in instead.
   * This provides a single-field smart auth experience.
   */
  async smartAuth(email: string, password: string): Promise<void> {
    try {
      await this.signUpWithEmail(email, password);
    } catch (err: unknown) {
      if (isFirebaseError(err) && err.code === 'auth/email-already-in-use') {
        await this.signInWithEmail(email, password);
      } else {
        throw err;
      }
    }
  }

  signInWithGoogle(): Promise<void> {
    return this.fb.signInWithPopup();
  }

  reauthenticateWithGoogle(): Promise<void> {
    const user = this.user();
    if (!user) return Promise.reject(new Error('No user is signed in'));
    return this.fb.reauthenticateWithPopup(user);
  }

  /** Signs the current user out of Firebase and clears the local auth state. */
  signOut(): Promise<void> {
    return this.fb.signOut();
  }

  /**
   * Returns a Firebase ID token for the current user, or null if not signed in.
   * Pass `forceRefresh: true` to bypass the cache and obtain a fresh token.
   */
  async getIdToken(forceRefresh = false): Promise<string | null> {
    const user = this.user();
    if (!user) return null;
    try {
      return await this.fb.getIdToken(user, forceRefresh);
    } catch {
      return null;
    }
  }
}
