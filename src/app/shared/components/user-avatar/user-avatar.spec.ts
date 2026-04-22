import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';

import { UserAvatar } from './user-avatar';

describe('UserAvatar', () => {
  let fixture: ComponentFixture<UserAvatar>;

  describe('with photoURL', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [UserAvatar],
      }).compileComponents();

      fixture = TestBed.createComponent(UserAvatar);
      fixture.componentRef.setInput('initial', 'R');
      fixture.componentRef.setInput('photoURL', 'https://example.com/avatar.jpg');
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(fixture.componentInstance).toBeTruthy();
    });

    it('should render img when photoURL provided', () => {
      const img = fixture.nativeElement.querySelector('img');
      expect(img).toBeTruthy();
      expect(img.src).toContain('avatar.jpg');
    });

    it('should NOT render initial span when photo is shown', () => {
      expect(fixture.nativeElement.querySelector('.user-avatar__initial')).toBeNull();
    });

    it('should fall back to initial span on image error', () => {
      const img = fixture.nativeElement.querySelector('img');
      img.dispatchEvent(new Event('error'));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.user-avatar__initial')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('img')).toBeNull();
    });
  });

  describe('without photoURL', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [UserAvatar],
      }).compileComponents();

      fixture = TestBed.createComponent(UserAvatar);
      fixture.componentRef.setInput('initial', 'M');
      fixture.componentRef.setInput('photoURL', null);
      fixture.detectChanges();
    });

    it('should render initial span when no photoURL', () => {
      const span = fixture.nativeElement.querySelector('.user-avatar__initial');
      expect(span).toBeTruthy();
      expect(span.textContent.trim()).toBe('M');
    });

    it('should NOT render img when no photoURL', () => {
      expect(fixture.nativeElement.querySelector('img')).toBeNull();
    });
  });

  describe('size attribute', () => {
    it('should apply data-size="sm" by default', async () => {
      await TestBed.configureTestingModule({ imports: [UserAvatar] }).compileComponents();
      fixture = TestBed.createComponent(UserAvatar);
      fixture.componentRef.setInput('initial', 'X');
      fixture.detectChanges();
      expect(fixture.nativeElement.getAttribute('data-size')).toBe('sm');
    });

    it('should apply data-size="md" when size input is md', async () => {
      await TestBed.configureTestingModule({ imports: [UserAvatar] }).compileComponents();
      fixture = TestBed.createComponent(UserAvatar);
      fixture.componentRef.setInput('initial', 'X');
      fixture.componentRef.setInput('size', 'md');
      fixture.detectChanges();
      expect(fixture.nativeElement.getAttribute('data-size')).toBe('md');
    });
  });
});
