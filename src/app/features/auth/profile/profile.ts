import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User, deleteUser } from 'firebase/auth';

import { AuthService, isFirebaseError } from '../../../core/auth/auth.service';
import { FavoritesService } from '../../characters/services/favorites.service';
import { TEXTS } from '../../../shared/i18n/texts';
import { UserAvatar } from '../../../shared/components/user-avatar/user-avatar';

@Component({
  selector: 'app-profile',
  imports: [UserAvatar],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * User profile page that shows account info and exposes destructive actions: sign-out
 * and permanent account deletion. Account deletion re-authenticates via Google popup
 * when Firebase requires a recent login before the operation is allowed.
 */
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

  protected readonly userInitial = computed(() => {
    const u = this.user();
    if (!u) return '?';
    if (u.displayName) return u.displayName[0].toUpperCase();
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
      await this.performDeletion(user);
      this.favoritesService.clearFavorites();
      await this.router.navigate(['/login']);
    } catch {
      this.deleteError.set(TEXTS.LOGIN_ERROR_GENERIC);
    } finally {
      this.isDeleting.set(false);
    }
  }

  /** Attempts to delete the user, re-authenticating via Google if a recent login is required. */
  private async performDeletion(user: User): Promise<void> {
    try {
      await deleteUser(user);
    } catch (err: unknown) {
      if (isFirebaseError(err) && err.code === 'auth/requires-recent-login') {
        await this.authService.reauthenticateWithGoogle();
        await deleteUser(user);
      } else {
        throw err;
      }
    }
  }

}
