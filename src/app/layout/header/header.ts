import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { TEXTS } from '../../shared/i18n/texts';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
/**
 * Global application header. Reflects the current auth state to show/hide navigation
 * links and renders the user's avatar initial or photo pulled from `AuthService`.
 */
export class Header {
  private readonly authService = inject(AuthService);

  protected readonly T = TEXTS;
  protected readonly isAuthenticated = this.authService.isAuthenticated;

  protected readonly userInitial = computed(() => {
    const user = this.authService.user();
    if (!user) return null;
    if (user.displayName) return user.displayName[0].toUpperCase();
    if (user.email) return user.email[0].toUpperCase();
    return '?';
  });

  protected readonly userPhotoURL = computed(() => this.authService.user()?.photoURL ?? null);

  protected readonly imageError = signal(false);

  constructor() {
    effect(() => {
      // Reset error state whenever the photo URL changes (e.g. new user signs in).
      this.userPhotoURL();
      this.imageError.set(false);
    });
  }

  protected onImageError(): void {
    this.imageError.set(true);
  }
}
