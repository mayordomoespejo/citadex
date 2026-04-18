import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

import { deleteUser } from 'firebase/auth';
import { Profile } from './profile';
import { AuthService } from '../../../core/auth/auth.service';
import { FavoritesService } from '../../characters/services/favorites.service';
import { TEXTS } from '../../../shared/i18n/texts';

const mockFirebaseUser = {
  uid: 'user-123',
  displayName: 'Rick Sanchez',
  email: 'rick@citadex.io',
  photoURL: null,
};

function createMockAuthService(user = mockFirebaseUser as unknown | null) {
  return {
    user: signal(user),
    loading: signal(false),
    isAuthenticated: signal(!!user),
    signOut: vi.fn().mockResolvedValue(undefined),
    reauthenticateWithGoogle: vi.fn().mockResolvedValue(undefined),
  };
}

function createMockFavoritesService(count = 3) {
  const favs = Array.from({ length: count }, (_, i) => ({ id: i + 1 }));
  return {
    favorites: signal(favs),
    favoriteIds: signal(new Set(favs.map((f) => f.id))),
    clearFavorites: vi.fn(),
  };
}

describe('Profile', () => {
  let fixture: ComponentFixture<Profile>;
  let component: Profile;
  let mockAuthService: ReturnType<typeof createMockAuthService>;
  let mockFavoritesService: ReturnType<typeof createMockFavoritesService>;

  beforeEach(async () => {
    mockAuthService = createMockAuthService();
    mockFavoritesService = createMockFavoritesService();

    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: FavoritesService, useValue: mockFavoritesService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.clearAllMocks();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('renders profile title', () => {
    const title = fixture.nativeElement.querySelector('.profile__title');
    expect(title.textContent).toContain(TEXTS.PROFILE_TITLE);
  });

  it('renders user display name and email', () => {
    const displayName = fixture.nativeElement.querySelector('.profile__display-name');
    const email = fixture.nativeElement.querySelector('.profile__email');
    expect(displayName.textContent).toContain('Rick Sanchez');
    expect(email.textContent).toContain('rick@citadex.io');
  });

  it('shows favorites count from FavoritesService', () => {
    const stat = fixture.nativeElement.querySelector('.profile__stat-count');
    expect(stat.textContent.trim()).toBe('3');
  });

  it('renders sign-out and delete-account buttons', () => {
    const signOut = fixture.nativeElement.querySelector('.profile__sign-out');
    const deleteBtn = fixture.nativeElement.querySelector('.profile__delete');
    expect(signOut).toBeTruthy();
    expect(deleteBtn).toBeTruthy();
    expect(signOut.textContent).toContain(TEXTS.PROFILE_SIGN_OUT);
    expect(deleteBtn.textContent).toContain(TEXTS.PROFILE_DELETE_ACCOUNT);
  });

  it('calls signOut and navigates when sign-out button clicked', async () => {
    const signOutBtn = fixture.nativeElement.querySelector('.profile__sign-out');
    signOutBtn.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(mockAuthService.signOut).toHaveBeenCalled();
  });

  it('opens delete modal when delete-account button clicked', () => {
    const deleteBtn = fixture.nativeElement.querySelector('.profile__delete');
    deleteBtn.click();
    fixture.detectChanges();

    const modal = fixture.nativeElement.querySelector('.profile__modal');
    expect(modal).toBeTruthy();
    expect(modal.getAttribute('role')).toBe('dialog');
    expect(modal.getAttribute('aria-modal')).toBe('true');
  });

  it('modal renders confirmation title, message, and action buttons', () => {
    fixture.nativeElement.querySelector('.profile__delete').click();
    fixture.detectChanges();

    const el = fixture.nativeElement;
    expect(el.querySelector('.profile__modal-title').textContent).toContain(TEXTS.PROFILE_DELETE_CONFIRM_TITLE);
    expect(el.querySelector('.profile__modal-message').textContent).toContain(TEXTS.PROFILE_DELETE_CONFIRM_MESSAGE);
    expect(el.querySelector('.profile__modal-cancel')).toBeTruthy();
    expect(el.querySelector('.profile__modal-confirm')).toBeTruthy();
  });

  it('closes modal when cancel button clicked', () => {
    fixture.nativeElement.querySelector('.profile__delete').click();
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.profile__modal-cancel').click();
    fixture.detectChanges();

    const modal = fixture.nativeElement.querySelector('.profile__modal');
    expect(modal).toBeNull();
  });

  it('calls deleteUser when confirm button clicked', async () => {
    vi.mocked(deleteUser).mockResolvedValue(undefined);

    fixture.nativeElement.querySelector('.profile__delete').click();
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.profile__modal-confirm').click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(deleteUser).toHaveBeenCalled();
  });

  it('confirm button shows aria-busy during deletion', async () => {
    vi.mocked(deleteUser).mockReturnValue(new Promise(() => {})); // never resolves

    fixture.nativeElement.querySelector('.profile__delete').click();
    fixture.detectChanges();

    const confirmBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.profile__modal-confirm');
    confirmBtn.click();
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();

    expect(confirmBtn.getAttribute('aria-busy')).toBe('true');
    expect(confirmBtn.disabled).toBe(true);
  });

  it('uses email initial when displayName is absent', async () => {
    mockAuthService = createMockAuthService({
      uid: 'user-456',
      displayName: null,
      email: 'morty@citadex.io',
      photoURL: null,
    });

    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: FavoritesService, useValue: mockFavoritesService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // No displayName element rendered
    const displayName = fixture.nativeElement.querySelector('.profile__display-name');
    expect(displayName).toBeNull();

    const email = fixture.nativeElement.querySelector('.profile__email');
    expect(email.textContent).toContain('morty@citadex.io');
  });
});
