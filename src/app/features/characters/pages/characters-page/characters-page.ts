import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';

import { CharactersService } from '../../services/characters.service';
import { CharacterCard } from '../../components/character-card/character-card';
import { SelectComponent } from '../../../../shared/components/select/select';
import { Character, ApiInfo } from '../../models/character.model';
import { TEXTS } from '../../../../shared/i18n/texts';

@Component({
  selector: 'app-characters-page',
  imports: [CharacterCard, ReactiveFormsModule, SelectComponent],
  templateUrl: './characters-page.html',
  styleUrl: './characters-page.scss',
  animations: [
    trigger('listStagger', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(12px)' }),
            stagger(30, [animate('250ms ease-out', style({ opacity: 1, transform: 'none' }))]),
          ],
          { optional: true },
        ),
      ]),
    ]),
  ],
})
export class CharactersPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly charactersService = inject(CharactersService);
  private readonly destroyRef = inject(DestroyRef);

  readonly searchControl = new FormControl('', { nonNullable: true });

  readonly filtersGroup = new FormGroup({
    status: new FormControl('', { nonNullable: true }),
    gender: new FormControl('', { nonNullable: true }),
  });

  protected readonly T = TEXTS;

  readonly statusOptions = [
    { label: TEXTS.CHARACTERS_FILTER_STATUS_ALL, value: '' },
    { label: TEXTS.CHARACTERS_FILTER_STATUS_ALIVE, value: 'alive' },
    { label: TEXTS.CHARACTERS_FILTER_STATUS_DEAD, value: 'dead' },
    { label: TEXTS.CHARACTERS_FILTER_STATUS_UNKNOWN, value: 'unknown' },
  ];

  readonly genderOptions = [
    { label: TEXTS.CHARACTERS_FILTER_GENDER_ALL, value: '' },
    { label: TEXTS.CHARACTERS_FILTER_GENDER_FEMALE, value: 'female' },
    { label: TEXTS.CHARACTERS_FILTER_GENDER_MALE, value: 'male' },
    { label: TEXTS.CHARACTERS_FILTER_GENDER_GENDERLESS, value: 'genderless' },
    { label: TEXTS.CHARACTERS_FILTER_GENDER_UNKNOWN, value: 'unknown' },
  ];

  characters = signal<Character[]>([]);
  info = signal<ApiInfo | null>(null);
  currentPage = signal(1);
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    // Pipeline principal: la URL es la fuente de verdad
    this.route.queryParamMap
      .pipe(
        map((params) => ({
          name: params.get('name') ?? '',
          status: params.get('status') ?? '',
          gender: params.get('gender') ?? '',
          page: Number(params.get('page') ?? '1'),
        })),
        tap(({ name, status, gender, page }) => {
          this.searchControl.setValue(name, { emitEvent: false });
          this.filtersGroup.setValue({ status, gender }, { emitEvent: false });
          this.currentPage.set(page);
          this.isLoading.set(true);
          this.error.set(null);
        }),
        switchMap((filters) =>
          this.charactersService.getCharacters(filters).pipe(
            catchError((err: HttpErrorResponse) => {
              this.isLoading.set(false);
              if (err.status === 404) {
                this.characters.set([]);
                this.info.set(null);
              } else {
                this.error.set(TEXTS.CHARACTERS_PAGE_ERROR);
              }
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => {
        this.characters.set(response.results);
        this.info.set(response.info);
        this.isLoading.set(false);
      });

    // Búsqueda de texto: debounced, resetea página
    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((name) => {
        this.router.navigate([], {
          queryParams: { name: name || null, page: null },
          queryParamsHandling: 'merge',
        });
      });

    // Filtros de selección: inmediatos, resetean página
    this.filtersGroup.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ status, gender }) => {
        this.router.navigate([], {
          queryParams: { status: status || null, gender: gender || null, page: null },
          queryParamsHandling: 'merge',
        });
      });
  }

  goToPage(page: number): void {
    this.router.navigate([], {
      queryParams: { page },
      queryParamsHandling: 'merge',
    });
  }
}
