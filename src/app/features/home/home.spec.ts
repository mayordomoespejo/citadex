import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Home } from './home';
import { HomeService, HomeStats } from './home.service';
import { TEXTS } from '../../shared/i18n/texts';

const MOCK_STATS: HomeStats = { characters: 826, episodes: 51, locations: 126 };

function createHomeServiceMock(stats: HomeStats = MOCK_STATS) {
  return { getStats: vi.fn().mockReturnValue(of(stats)) };
}

describe('Home', () => {
  let fixture: ComponentFixture<Home>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        { provide: HomeService, useValue: createHomeServiceMock() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render hero section', () => {
    expect(el.querySelector('.home__hero')).toBeTruthy();
  });

  it('should display the logo image', () => {
    const img = el.querySelector<HTMLImageElement>('.home__logo');
    expect(img).toBeTruthy();
    expect(img?.alt).toBe(TEXTS.HEADER_LOGO_ALT);
  });

  it('should render h1 with title text', () => {
    const h1 = el.querySelector('h1');
    expect(h1?.textContent).toContain(TEXTS.HOME_TITLE_PREFIX);
    expect(h1?.textContent).toContain(TEXTS.HOME_TITLE_HIGHLIGHT);
  });

  it('should render subtitle', () => {
    expect(el.textContent).toContain(TEXTS.HOME_SUBTITLE);
  });

  it('should render CTA link to /characters', () => {
    const cta = el.querySelector<HTMLAnchorElement>('.home__cta');
    expect(cta).toBeTruthy();
    expect(cta?.getAttribute('href')).toContain('characters');
    expect(cta?.textContent?.trim()).toContain(TEXTS.HOME_CTA_LABEL);
  });

  it('should display stats after service resolves', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const statValues = el.querySelectorAll('.home__stat-value');
    expect(statValues.length).toBe(3);
    expect(statValues[0].textContent).toContain('826');
    expect(statValues[1].textContent).toContain('51');
    expect(statValues[2].textContent).toContain('126');
  });

  it('should call HomeService.getStats on init', () => {
    const svc = TestBed.inject(HomeService);
    expect(svc.getStats).toHaveBeenCalledOnce();
  });

  describe('before service emits', () => {
    let noStatFixture: ComponentFixture<Home>;

    beforeEach(async () => {
      TestBed.resetTestingModule();
      const svc = { getStats: vi.fn().mockReturnValue(of()) };
      await TestBed.configureTestingModule({
        imports: [Home],
        providers: [
          provideRouter([]),
          { provide: HomeService, useValue: svc },
        ],
      }).compileComponents();
      noStatFixture = TestBed.createComponent(Home);
      noStatFixture.detectChanges();
    });

    it('should NOT show stats section', () => {
      expect(noStatFixture.nativeElement.querySelector('.home__stats')).toBeNull();
    });
  });
});
