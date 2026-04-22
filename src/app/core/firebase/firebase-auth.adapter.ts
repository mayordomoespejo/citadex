import { InjectionToken } from '@angular/core';
import type { User } from 'firebase/auth';

/**
 * Abstracts all Firebase Auth SDK calls behind an injectable interface.
 * Allows tests to provide a mock adapter via TestBed without needing vi.mock
 * to intercept module-level function references.
 */
export interface FirebaseAuthAdapter {
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
  createUserWithEmailAndPassword(email: string, password: string): Promise<void>;
  signInWithEmailAndPassword(email: string, password: string): Promise<void>;
  signInWithPopup(): Promise<void>;
  reauthenticateWithPopup(user: User): Promise<void>;
  signOut(): Promise<void>;
  getIdToken(user: User, forceRefresh?: boolean): Promise<string>;
  deleteUser(user: User): Promise<void>;
}

export const FIREBASE_AUTH_ADAPTER = new InjectionToken<FirebaseAuthAdapter>(
  'firebase.auth.adapter',
);
