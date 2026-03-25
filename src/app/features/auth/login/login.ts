import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { TEXTS } from '../../../shared/i18n/texts';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly T = TEXTS;
  protected readonly showPassword = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly introVisible = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.introVisible.set(false), 1800);
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
      this.errorMessage.set(this.mapFirebaseError(err));
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
      this.errorMessage.set(this.mapFirebaseError(err));
    } finally {
      this.isLoading.set(false);
    }
  }

  private mapFirebaseError(err: unknown): string {
    if (typeof err === 'object' && err !== null && 'code' in err) {
      const code = (err as { code: string }).code;
      switch (code) {
        case 'auth/invalid-email':
          return TEXTS.LOGIN_ERROR_EMAIL_INVALID;
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          return TEXTS.LOGIN_ERROR_WRONG_PASSWORD;
        case 'auth/user-not-found':
          return TEXTS.LOGIN_ERROR_USER_NOT_FOUND;
        case 'auth/too-many-requests':
          return TEXTS.LOGIN_ERROR_TOO_MANY_REQUESTS;
        default:
          return TEXTS.LOGIN_ERROR_GENERIC;
      }
    }
    return TEXTS.LOGIN_ERROR_GENERIC;
  }
}
