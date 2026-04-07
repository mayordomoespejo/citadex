import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService, mapFirebaseError } from '../../../core/auth/auth.service';
import { TEXTS } from '../../../shared/i18n/texts';

// Duration of the intro fade-out animation (matches CSS transition)
const INTRO_ANIMATION_DURATION_MS = 1800;

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
/**
 * Authentication page that handles both sign-up and sign-in via a single form.
 * Delegates to `AuthService.smartAuth`, which attempts registration first and falls
 * back to sign-in if the email is already in use.
 */
export class Login implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly T = TEXTS;
  protected readonly showPassword = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly introVisible = signal(true);

  private introTimeoutId: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.introTimeoutId = setTimeout(() => this.introVisible.set(false), INTRO_ANIMATION_DURATION_MS);
  }

  ngOnDestroy(): void {
    if (this.introTimeoutId) clearTimeout(this.introTimeoutId);
  }

  protected readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected get emailInvalid(): boolean {
    const ctrl = this.form.controls.email;
    return ctrl.invalid && ctrl.touched;
  }

  protected get passwordInvalid(): boolean {
    const ctrl = this.form.controls.password;
    return ctrl.invalid && ctrl.touched;
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  protected removeReadonly(event: FocusEvent): void {
    if (event.target instanceof HTMLInputElement) {
      event.target.removeAttribute('readonly');
    }
  }

  /**
   * Validates the form and calls `smartAuth` with the entered credentials.
   * On success navigates to `/characters`; on failure surfaces a localized error message.
   */
  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.getRawValue();

    try {
      await this.authService.smartAuth(email, password);
      await this.router.navigate(['/characters']);
    } catch (err: unknown) {
      this.errorMessage.set(mapFirebaseError(err, this.T.LOGIN_ERROR_GENERIC));
    } finally {
      this.isLoading.set(false);
    }
  }

  protected async onGoogleSignIn(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      await this.authService.signInWithGoogle();
      await this.router.navigate(['/characters']);
    } catch (err: unknown) {
      this.errorMessage.set(mapFirebaseError(err, this.T.LOGIN_ERROR_GENERIC));
    } finally {
      this.isLoading.set(false);
    }
  }

}
