import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { environment } from '../../../environments/environment';
import { TEXTS } from '../../shared/i18n/texts';

interface ApiStats {
  characters: number;
  episodes: number;
  locations: number;
}

interface ApiCountResponse {
  info: { count: number };
}

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly base = environment.apiBaseUrl;

  protected readonly T = TEXTS;

  stats = signal<ApiStats | null>(null);

  ngOnInit(): void {
    forkJoin({
      characters: this.http.get<ApiCountResponse>(`${this.base}/character`),
      episodes: this.http.get<ApiCountResponse>(`${this.base}/episode`),
      locations: this.http.get<ApiCountResponse>(`${this.base}/location`),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.stats.set({
          characters: res.characters.info.count,
          episodes: res.episodes.info.count,
          locations: res.locations.info.count,
        });
      });
  }
}
