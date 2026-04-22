import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { HomeService } from './home.service';

describe('HomeService', () => {
  let service: HomeService;
  let httpMock: HttpTestingController;

  const BASE = environment.apiBaseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(HomeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call /character, /episode and /location endpoints', () => {
    service.getStats().subscribe();

    httpMock.expectOne(`${BASE}/character`).flush({ info: { count: 826 } });
    httpMock.expectOne(`${BASE}/episode`).flush({ info: { count: 51 } });
    httpMock.expectOne(`${BASE}/location`).flush({ info: { count: 126 } });
  });

  it('should map API response to HomeStats shape', async () => {
    const statsPromise = firstValueFrom(service.getStats());

    httpMock.expectOne(`${BASE}/character`).flush({ info: { count: 826 } });
    httpMock.expectOne(`${BASE}/episode`).flush({ info: { count: 51 } });
    httpMock.expectOne(`${BASE}/location`).flush({ info: { count: 126 } });

    const stats = await statsPromise;
    expect(stats.characters).toBe(826);
    expect(stats.episodes).toBe(51);
    expect(stats.locations).toBe(126);
  });

  it('should emit a single value that combines all three counts', async () => {
    const statsPromise = firstValueFrom(service.getStats());

    httpMock.expectOne(`${BASE}/character`).flush({ info: { count: 10 } });
    httpMock.expectOne(`${BASE}/episode`).flush({ info: { count: 20 } });
    httpMock.expectOne(`${BASE}/location`).flush({ info: { count: 30 } });

    const stats = await statsPromise;
    expect(stats).toEqual({ characters: 10, episodes: 20, locations: 30 });
  });

  it('should use GET for all requests', () => {
    service.getStats().subscribe();

    const reqs = httpMock.match(() => true);
    expect(reqs.length).toBe(3);
    for (const req of reqs) {
      expect(req.request.method).toBe('GET');
      req.flush({ info: { count: 0 } });
    }
  });
});
