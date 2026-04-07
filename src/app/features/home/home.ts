import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { HomeService, HomeStats } from './home.service';
import { TEXTS } from '../../shared/i18n/texts';

/** Landing page component with a hero section and live universe stats. The `stats` signal is populated on init via `HomeService.getStats()` and drives the stats display in the template. */
@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly homeService = inject(HomeService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly T = TEXTS;
  protected readonly stats = signal<HomeStats | null>(null);

  ngOnInit(): void {
    this.homeService
      .getStats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((stats) => this.stats.set(stats));
  }
}
