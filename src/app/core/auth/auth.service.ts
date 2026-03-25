import { Injectable, computed, signal } from '@angular/core';
import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reauthenticateWithPopup,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

import { auth } from '../firebase/firebase.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<User | null>(null);
  readonly loading = signal(true);
  readonly isAuthenticated = computed(() => !!this.user());

  /** Must be called once from the app root to start listening to auth state. */
  init(): void {
    onAuthStateChanged(auth, (user) => {
      this.user.set(user);
      this.loading.set(false);
    });
  }

  signInWithEmail(email: string, password: string): Promise<void> {
    return signInWithEmailAndPassword(auth, email, password).then(() => undefined);
  }

  signUpWithEmail(email: string, password: string): Promise<void> {
    return createUserWithEmailAndPassword(auth, email, password).then(() => undefined);
  }

  /**
   * Tries to create the account; if the email is already in use, signs in instead.
   * This provides a single-field smart auth experience.
   */
  async smartAuth(email: string, password: string): Promise<void> {
    try {
      await this.signUpWithEmail(email, password);
    } catch (err: unknown) {
      if (this.isFirebaseError(err) && err.code === 'auth/email-already-in-use') {
        await this.signInWithEmail(email, password);
      } else {
        throw err;
      }
    }
  }

  signInWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider).then(() => undefined);
  }

  reauthenticateWithGoogle(): Promise<void> {
    const user = this.user();
    if (!user) return Promise.reject(new Error('No user is signed in'));
    const provider = new GoogleAuthProvider();
    return reauthenticateWithPopup(user, provider).then(() => undefined);
  }

  signOut(): Promise<void> {
    return signOut(auth);
  }

  private isFirebaseError(err: unknown): err is { code: string } {
    return typeof err === 'object' && err !== null && 'code' in err;
  }
}
