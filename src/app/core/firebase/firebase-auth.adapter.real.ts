import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser,
  getIdToken,
  onAuthStateChanged,
  reauthenticateWithPopup,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import type { User } from 'firebase/auth';

import { auth } from './firebase.config';
import type { FirebaseAuthAdapter } from './firebase-auth.adapter';

/**
 * Production implementation of FirebaseAuthAdapter that delegates to the Firebase Auth SDK.
 * Provided at root level in app.config.ts.
 */
export const realFirebaseAuthAdapter: FirebaseAuthAdapter = {
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  },
  createUserWithEmailAndPassword(email, password) {
    return createUserWithEmailAndPassword(auth, email, password).then(() => undefined);
  },
  signInWithEmailAndPassword(email, password) {
    return signInWithEmailAndPassword(auth, email, password).then(() => undefined);
  },
  signInWithPopup() {
    return signInWithPopup(auth, new GoogleAuthProvider()).then(() => undefined);
  },
  reauthenticateWithPopup(user: User) {
    return reauthenticateWithPopup(user, new GoogleAuthProvider()).then(() => undefined);
  },
  signOut() {
    return signOut(auth);
  },
  getIdToken(user: User, forceRefresh = false) {
    return getIdToken(user, forceRefresh);
  },
  deleteUser(user: User) {
    return deleteUser(user);
  },
};
