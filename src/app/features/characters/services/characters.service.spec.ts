import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { environment } from '../../../../environments/environment';
import { CharactersService } from './characters.service';

const BASE_URL = `${environment.apiBaseUrl}/character`;

describe('CharactersService', () => {
  let service: CharactersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CharactersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getCharacters()', () => {
    it('should request page 1 by default', () => {
      service.getCharacters().subscribe();

      const req = httpMock.expectOne((r) => r.url === BASE_URL);
      expect(req.request.params.get('page')).toBe('1');
      req.flush({ info: {}, results: [] });
    });

    it('should include name param when provided', () => {
      service.getCharacters({ name: 'rick' }).subscribe();

      const req = httpMock.expectOne((r) => r.url === BASE_URL);
      expect(req.request.params.get('name')).toBe('rick');
      req.flush({ info: {}, results: [] });
    });

    it('should include all filter params', () => {
      service.getCharacters({ name: 'rick', status: 'alive', gender: 'male', page: 3 }).subscribe();

      const req = httpMock.expectOne((r) => r.url === BASE_URL);
      expect(req.request.params.get('name')).toBe('rick');
      expect(req.request.params.get('status')).toBe('alive');
      expect(req.request.params.get('gender')).toBe('male');
      expect(req.request.params.get('page')).toBe('3');
      req.flush({ info: {}, results: [] });
    });

    it('should omit empty string filters from params', () => {
      service.getCharacters({ name: '', status: '', gender: '' }).subscribe();

      const req = httpMock.expectOne((r) => r.url === BASE_URL);
      expect(req.request.params.has('name')).toBe(false);
      expect(req.request.params.has('status')).toBe(false);
      expect(req.request.params.has('gender')).toBe(false);
      req.flush({ info: {}, results: [] });
    });
  });

  describe('getCharacterById()', () => {
    it('should request the correct character URL', () => {
      service.getCharacterById(42).subscribe();

      const req = httpMock.expectOne(`${BASE_URL}/42`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });
});
