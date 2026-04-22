import { AfterViewChecked, ChangeDetectionStrategy, Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import type { User } from 'firebase/auth';

import { AuthService, isFirebaseError } from '../../../core/auth/auth.service';
import { FIREBASE_AUTH_ADAPTER } from '../../../core/firebase/firebase-auth.adapter';
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
export class Profile implements AfterViewChecked {
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FIREBASE_AUTH_ADAPTER);
  private readonly favoritesService = inject(FavoritesService);
  private readonly router = inject(Router);

  @ViewChild('deleteAccountBtn') private readonly deleteAccountBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild('modalCancelBtn') private readonly modalCancelBtn?: ElementRef<HTMLButtonElement>;

  protected readonly T = TEXTS;
  protected readonly showDeleteModal = signal(false);
  protected readonly isDeleting = signal(false);
  protected readonly deleteError = signal<string | null>(null);

  private pendingFocus: 'modal' | 'deleteBtn' | null = null;

  ngAfterViewChecked(): void {
    if (this.pendingFocus === 'modal' && this.modalCancelBtn?.nativeElement) {
      this.modalCancelBtn.nativeElement.focus();
      this.pendingFocus = null;
    } else if (this.pendingFocus === 'deleteBtn' && this.deleteAccountBtn?.nativeElement) {
      this.deleteAccountBtn.nativeElement.focus();
      this.pendingFocus = null;
    }
  }

  protected readonly user = this.authService.user;
  protected readonly favoritesCount = computed(() => this.favoritesService.favorites().length);

  protected readonly userInitial = computed(() => {
    const u = this.user();
    if (!u) return '?';
    if (u.displayName) return u.displayName[0].toUpperCase();
    if (u.email) return u.email[0].toUpperCase();
    return '?';
  });

  /** Signs the current user out and redirects to the login page. */
  protected async onSignOut(): Promise<void> {
    await this.authService.signOut();
    await this.router.navigate(['/login']);
  }

  /** Opens the account deletion confirmation modal and clears any previous error state. */
  protected openDeleteModal(): void {
    this.deleteError.set(null);
    this.showDeleteModal.set(true);
    this.pendingFocus = 'modal';
  }

  /** Closes the account deletion confirmation modal and clears any error state. */
  protected closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.deleteError.set(null);
    this.pendingFocus = 'deleteBtn';
  }

  /** Initiates account deletion: clears favorites and navigates to login on success. */
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
      await this.fb.deleteUser(user);
    } catch (err: unknown) {
      if (isFirebaseError(err) && err.code === 'auth/requires-recent-login') {
        await this.authService.reauthenticateWithGoogle();
        await this.fb.deleteUser(user);
      } else {
        throw err;
      }
    }
  }

}
