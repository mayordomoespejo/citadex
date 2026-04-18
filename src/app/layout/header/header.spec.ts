import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

import { Header } from './header';
import { AuthService } from '../../core/auth/auth.service';

const mockUser = { uid: 'u1', email: 'rick@c137.com', displayName: 'Rick', photoURL: null };

function createAuthMock(user: typeof mockUser | null = null) {
  const userSignal = signal<typeof mockUser | null>(user);
  return {
    user: userSignal,
    isAuthenticated: signal(user !== null),
    loading: signal(false),
  };
}

describe('Header', () => {
  describe('unauthenticated state', () => {
    beforeEach(async () => {
      const authMock = createAuthMock(null);
      await TestBed.configureTestingModule({
        imports: [Header],
        providers: [
          provideRouter([]),
          { provide: AuthService, useValue: authMock },
        ],
      }).compileComponents();
    });

    it('should create', () => {
      const fixture = TestBed.createComponent(Header);
      expect(fixture.componentInstance).toBeTruthy();
    });

    it('should render the logo link', () => {
      const fixture = TestBed.createComponent(Header);
      fixture.detectChanges();
      const logo = fixture.nativeElement.querySelector('.header__logo');
      expect(logo).toBeTruthy();
      expect(logo.textContent.trim()).toBe('Citadex');
    });

    it('should show login link when not authenticated', () => {
      const fixture = TestBed.createComponent(Header);
      fixture.detectChanges();
      const loginLink = fixture.nativeElement.querySelector('a[routerLink="/login"]');
      expect(loginLink).toBeTruthy();
    });

    it('should NOT show characters or favorites links when not authenticated', () => {
      const fixture = TestBed.createComponent(Header);
      fixture.detectChanges();
      const nav = fixture.nativeElement.querySelector('.header__nav');
      expect(nav.querySelector('a[routerLink="/characters"]')).toBeNull();
      expect(nav.querySelector('a[routerLink="/favorites"]')).toBeNull();
    });

    it('should NOT render user avatar when not authenticated', () => {
      const fixture = TestBed.createComponent(Header);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-user-avatar')).toBeNull();
    });
  });

  describe('authenticated state', () => {
    beforeEach(async () => {
      const authMock = createAuthMock(mockUser);
      await TestBed.configureTestingModule({
        imports: [Header],
        providers: [
          provideRouter([]),
          { provide: AuthService, useValue: authMock },
        ],
      }).compileComponents();
    });

    it('should show characters nav link when authenticated', () => {
      const fixture = TestBed.createComponent(Header);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('a[routerLink="/characters"]')).toBeTruthy();
    });

    it('should show favorites nav link when authenticated', () => {
      const fixture = TestBed.createComponent(Header);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('a[routerLink="/favorites"]')).toBeTruthy();
    });

    it('should render user avatar when authenticated', () => {
      const fixture = TestBed.createComponent(Header);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-user-avatar')).toBeTruthy();
    });

    it('should set aria-label on profile avatar link', () => {
      const fixture = TestBed.createComponent(Header);
      fixture.detectChanges();
      const avatarLink = fixture.nativeElement.querySelector('a[routerLink="/profile"]');
      expect(avatarLink?.getAttribute('aria-label')).toBeTruthy();
    });

    it('should NOT show login link when authenticated', () => {
      const fixture = TestBed.createComponent(Header);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('a[routerLink="/login"]')).toBeNull();
    });
  });
});
