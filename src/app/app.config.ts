import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter, TitleStrategy } from '@angular/router';

import { routes } from './app.routes';
import { AppTitleStrategy } from './core/app-title.strategy';
import { FIREBASE_AUTH_ADAPTER } from './core/firebase/firebase-auth.adapter';
import { realFirebaseAuthAdapter } from './core/firebase/firebase-auth.adapter.real';

/**
 * Root application configuration.
 * `withFetch()` opts the HTTP client into the native Fetch API (required for SSR compatibility).
 * The `TitleStrategy` provider swaps in `AppTitleStrategy` for custom per-route page titles.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
    { provide: FIREBASE_AUTH_ADAPTER, useValue: realFirebaseAuthAdapter },
  ],
};
