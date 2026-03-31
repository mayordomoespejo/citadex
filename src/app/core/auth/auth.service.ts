import { Injectable, OnDestroy, computed, signal } from '@angular/core';
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

export function isFirebaseError(err: unknown): err is { code: string } {
  return typeof err === 'object' && err !== null && 'code' in err;
}

export function mapFirebaseError(err: unknown, fallback: string): string {
  if (isFirebaseError(err)) {
    switch (err.code) {
      case 'auth/invalid-email':
        return 'Introduce un correo electrónico válido.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Contraseña incorrecta.';
      case 'auth/user-not-found':
        return 'No existe una cuenta con ese correo.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Inténtalo más tarde.';
      case 'auth/popup-blocked':
        return 'El popup fue bloqueado. Permite popups para este sitio.';
      case 'auth/network-request-failed':
        return 'Error de red. Comprueba tu conexión.';
      default:
        return fallback;
    }
  }
  return fallback;
}

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {
  readonly user = signal<User | null>(null);
  readonly loading = signal(true);
  readonly isAuthenticated = computed(() => !!this.user());

  private unsubscribeAuth: (() => void) | null = null;

  /** Must be called once from the app root to start listening to auth state. */
  init(): void {
    this.unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      this.user.set(user);
      this.loading.set(false);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAuth?.();
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
      if (isFirebaseError(err) && err.code === 'auth/email-already-in-use') {
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

}
