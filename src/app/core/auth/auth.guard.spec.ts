import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { signal } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';

import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

function createAuthMock(isAuth: boolean, loading = false) {
  return {
    loading: signal(loading),
    isAuthenticated: signal(isAuth),
    user: signal(isAuth ? { uid: 'u1' } : null),
  };
}

async function runGuard(_authMock: ReturnType<typeof createAuthMock>): Promise<boolean | UrlTree> {
  const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
  return firstValueFrom(result as Observable<boolean | UrlTree>);
}

describe('authGuard', () => {
  let router: Router;

  describe('when already resolved (loading = false)', () => {
    describe('and user is authenticated', () => {
      beforeEach(() => {
        const authMock = createAuthMock(true, false);
        TestBed.configureTestingModule({
          providers: [
            provideRouter([]),
            { provide: AuthService, useValue: authMock },
          ],
        });
        router = TestBed.inject(Router);
      });

      it('should return true', async () => {
        const result = await runGuard(createAuthMock(true, false));
        expect(result).toBe(true);
      });
    });

    describe('and user is NOT authenticated', () => {
      beforeEach(() => {
        const authMock = createAuthMock(false, false);
        TestBed.configureTestingModule({
          providers: [
            provideRouter([]),
            { provide: AuthService, useValue: authMock },
          ],
        });
        router = TestBed.inject(Router);
      });

      it('should return a UrlTree redirect to /login', async () => {
        const result = await runGuard(createAuthMock(false, false));
        expect(result instanceof UrlTree).toBe(true);
        const urlTree = result as UrlTree;
        expect(router.serializeUrl(urlTree)).toBe('/login');
      });
    });
  });

  describe('when loading resolves from true to false', () => {
    it('should wait for loading to complete then allow authenticated user', async () => {
      const loadingSignal = signal(true);
      const authMock = {
        loading: loadingSignal,
        isAuthenticated: signal(true),
        user: signal({ uid: 'u1' }),
      };

      TestBed.configureTestingModule({
        providers: [
          provideRouter([]),
          { provide: AuthService, useValue: authMock },
        ],
      });

      const guardPromise = runGuard(authMock as never);
      // Resolve loading inside the Angular zone so the observable fires
      TestBed.flushEffects();
      loadingSignal.set(false);
      TestBed.flushEffects();

      const result = await guardPromise;
      expect(result).toBe(true);
    });
  });
});
