import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { deleteUser } from 'firebase/auth';

import { AuthService } from '../../../core/auth/auth.service';
import { FavoritesService } from '../../characters/services/favorites.service';
import { TEXTS } from '../../../shared/i18n/texts';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private readonly authService = inject(AuthService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly router = inject(Router);

  protected readonly T = TEXTS;
  protected readonly showDeleteModal = signal(false);
  protected readonly isDeleting = signal(false);
  protected readonly deleteError = signal<string | null>(null);

  protected readonly user = this.authService.user;
  protected readonly favoritesCount = computed(() => this.favoritesService.favorites().length);

  protected initials = computed(() => {
    const u = this.user();
    if (!u) return '?';
    if (u.displayName) {
      return u.displayName
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
    }
    if (u.email) return u.email[0].toUpperCase();
    return '?';
  });

  protected async onSignOut(): Promise<void> {
    await this.authService.signOut();
    await this.router.navigate(['/login']);
  }

  protected openDeleteModal(): void {
    this.deleteError.set(null);
    this.showDeleteModal.set(true);
  }

  protected closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.deleteError.set(null);
  }

  protected async onDeleteAccount(): Promise<void> {
    const user = this.user();
    if (!user) return;

    this.isDeleting.set(true);
    this.deleteError.set(null);

    try {
      this.favoritesService.clearFavorites();
      await deleteUser(user);
      await this.router.navigate(['/login']);
    } catch (err: unknown) {
      if (this.isFirebaseError(err) && err.code === 'auth/requires-recent-login') {
        try {
          await this.authService.reauthenticateWithGoogle();
          this.favoritesService.clearFavorites();
          await deleteUser(user);
          await this.router.navigate(['/login']);
        } catch (reAuthErr: unknown) {
          this.deleteError.set(TEXTS.LOGIN_ERROR_GENERIC);
        }
      } else {
        this.deleteError.set(TEXTS.LOGIN_ERROR_GENERIC);
      }
    } finally {
      this.isDeleting.set(false);
    }
  }

  private isFirebaseError(err: unknown): err is { code: string } {
    return typeof err === 'object' && err !== null && 'code' in err;
  }
}
