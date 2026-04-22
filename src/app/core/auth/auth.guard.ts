import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

import { AuthService } from './auth.service';

/**
 * Route guard that defers activation until the initial Firebase auth state is resolved.
 * Uses `toObservable`, `filter`, and `take` to wait for `AuthService.loading` to become
 * false, then allows or redirects to `/login` based on authentication status.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait until the initial auth check completes (loading becomes false)
  return toObservable(authService.loading).pipe(
    filter((loading) => !loading),
    take(1),
    map(() => {
      if (authService.isAuthenticated()) {
        return true;
      }
      return router.createUrlTree(['/login']);
    }),
  );
};
