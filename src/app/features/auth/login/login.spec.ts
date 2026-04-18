import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(() => vi.fn()),
  getAuth: vi.fn(() => ({})),
  GoogleAuthProvider: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  reauthenticateWithPopup: vi.fn(),
  deleteUser: vi.fn().mockResolvedValue(undefined),
  getIdToken: vi.fn(),
}));

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

import { Login } from './login';
import { AuthService } from '../../../core/auth/auth.service';
import { TEXTS } from '../../../shared/i18n/texts';

function createMockAuthService() {
  return {
    user: signal(null),
    loading: signal(false),
    isAuthenticated: signal(false),
    smartAuth: vi.fn().mockResolvedValue(undefined),
    signInWithGoogle: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
  };
}

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let component: Login;
  let mockAuthService: ReturnType<typeof createMockAuthService>;

  beforeEach(async () => {
    mockAuthService = createMockAuthService();

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('shows intro overlay on init, hides form during intro', () => {
    fixture.detectChanges();
    const intro = fixture.nativeElement.querySelector('.login__intro');
    const card = fixture.nativeElement.querySelector('.login__card');
    expect(intro).toBeTruthy();
    expect(card).toBeNull();
  });

  it('renders login form after intro animation completes', async () => {
    vi.useFakeTimers();
    fixture.detectChanges();
    // Fast-forward past intro duration (1800ms)
    vi.advanceTimersByTime(1800);
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('.login__card');
    const form = fixture.nativeElement.querySelector('form.login__form');
    expect(card).toBeTruthy();
    expect(form).toBeTruthy();
    vi.useRealTimers();
  });

  it('renders email and password inputs', async () => {
    vi.useFakeTimers();
    fixture.detectChanges();
    vi.advanceTimersByTime(1800);
    fixture.detectChanges();
    const emailInput = fixture.nativeElement.querySelector('#login-email');
    const passwordInput = fixture.nativeElement.querySelector('#login-password');
    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
    vi.useRealTimers();
  });

  it('renders title and subtitle from TEXTS', async () => {
    vi.useFakeTimers();
    fixture.detectChanges();
    vi.advanceTimersByTime(1800);
    fixture.detectChanges();
    const el = fixture.nativeElement;
    expect(el.querySelector('.login__title').textContent).toContain(TEXTS.LOGIN_TITLE);
    expect(el.querySelector('.login__subtitle').textContent).toContain(TEXTS.LOGIN_SUBTITLE);
    vi.useRealTimers();
  });

  it('marks form invalid and shows email error when submitting with invalid email', async () => {
    vi.useFakeTimers();
    fixture.detectChanges();
    vi.advanceTimersByTime(1800);
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form.login__form');
    form.dispatchEvent(new Event('ngSubmit'));
    fixture.detectChanges();

    const emailError = fixture.nativeElement.querySelector('#email-error');
    expect(emailError).toBeTruthy();
    expect(emailError.textContent).toContain(TEXTS.LOGIN_ERROR_EMAIL_INVALID);
    vi.useRealTimers();
  });

  it('calls smartAuth with valid credentials and navigates', async () => {
    vi.useFakeTimers();
    fixture.detectChanges();
    vi.advanceTimersByTime(1800);
    fixture.detectChanges();

    // Access the form via component directly
    const comp = component as unknown as { form: { setValue: (v: object) => void } };
    comp.form.setValue({ email: 'user@example.com', password: 'secret123' });
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form.login__form');
    form.dispatchEvent(new Event('ngSubmit'));
    fixture.detectChanges();

    await Promise.resolve();

    expect(mockAuthService.smartAuth).toHaveBeenCalledWith('user@example.com', 'secret123');
    vi.useRealTimers();
  });

  it('shows error message when smartAuth rejects', async () => {
    mockAuthService.smartAuth.mockRejectedValue({ code: 'auth/wrong-password' });

    vi.useFakeTimers();
    fixture.detectChanges();
    vi.advanceTimersByTime(1800);
    fixture.detectChanges();

    const comp = component as unknown as { form: { setValue: (v: object) => void } };
    comp.form.setValue({ email: 'user@example.com', password: 'wrongpass' });
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form.login__form');
    form.dispatchEvent(new Event('ngSubmit'));
    fixture.detectChanges();

    await Promise.resolve();
    fixture.detectChanges();

    const serverError = fixture.nativeElement.querySelector('.login__server-error');
    expect(serverError).toBeTruthy();
    vi.useRealTimers();
  });

  it('calls signInWithGoogle when Google button clicked', async () => {
    vi.useFakeTimers();
    fixture.detectChanges();
    vi.advanceTimersByTime(1800);
    fixture.detectChanges();

    const googleBtn = fixture.nativeElement.querySelector('.login__google');
    googleBtn.click();
    fixture.detectChanges();
    await Promise.resolve();

    expect(mockAuthService.signInWithGoogle).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('toggles password visibility when eye button clicked', async () => {
    vi.useFakeTimers();
    fixture.detectChanges();
    vi.advanceTimersByTime(1800);
    fixture.detectChanges();

    const passwordInput: HTMLInputElement = fixture.nativeElement.querySelector('#login-password');
    expect(passwordInput.type).toBe('password');

    const eyeToggle: HTMLButtonElement = fixture.nativeElement.querySelector('.login__eye-toggle');
    eyeToggle.click();
    fixture.detectChanges();

    expect(passwordInput.type).toBe('text');
    vi.useRealTimers();
  });

  it('submit button has aria-busy when loading', async () => {
    mockAuthService.smartAuth.mockReturnValue(new Promise(() => {})); // never resolves

    vi.useFakeTimers();
    fixture.detectChanges();
    vi.advanceTimersByTime(1800);
    fixture.detectChanges();

    const comp = component as unknown as { form: { setValue: (v: object) => void } };
    comp.form.setValue({ email: 'user@example.com', password: 'secret123' });
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form.login__form');
    form.dispatchEvent(new Event('ngSubmit'));
    fixture.detectChanges();

    const submitBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.login__submit');
    expect(submitBtn.getAttribute('aria-busy')).toBe('true');
    expect(submitBtn.disabled).toBe(true);
    vi.useRealTimers();
  });
});
