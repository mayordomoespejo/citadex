import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NotFound } from './not-found';
import { TEXTS } from '../../i18n/texts';

describe('NotFound', () => {
  let fixture: ComponentFixture<NotFound>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFound],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFound);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display 404 code', () => {
    expect(el.querySelector('.not-found__code')?.textContent).toContain(TEXTS.NOT_FOUND_CODE);
  });

  it('should display "Page not found" title', () => {
    expect(el.querySelector('.not-found__title')?.textContent).toContain(TEXTS.NOT_FOUND_TITLE);
  });

  it('should display descriptive message', () => {
    expect(el.querySelector('.not-found__message')?.textContent).toContain(TEXTS.NOT_FOUND_MESSAGE);
  });

  it('should render a back-to-characters link', () => {
    const link = el.querySelector<HTMLAnchorElement>('.not-found__link');
    expect(link).toBeTruthy();
    expect(link?.textContent?.trim()).toBe(TEXTS.NOT_FOUND_BACK_LINK);
  });

  it('should link back to /characters route', () => {
    const link = el.querySelector<HTMLAnchorElement>('.not-found__link');
    // RouterLink renders href relative to the base href in tests
    expect(link?.getAttribute('href')).toContain('characters');
  });
});
