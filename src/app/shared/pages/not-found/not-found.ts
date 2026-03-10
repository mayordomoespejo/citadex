import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TEXTS } from '../../i18n/texts';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <div class="not-found">
      <p class="not-found__code">{{ T.NOT_FOUND_CODE }}</p>
      <h1 class="not-found__title">{{ T.NOT_FOUND_TITLE }}</h1>
      <p class="not-found__message">{{ T.NOT_FOUND_MESSAGE }}</p>
      <a class="not-found__link" routerLink="/characters">{{ T.NOT_FOUND_BACK_LINK }}</a>
    </div>
  `,
  styles: `
    .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      text-align: center;
      gap: var(--space-4);

      &__code {
        font-size: 6rem;
        font-weight: 700;
        color: var(--color-text-muted);
        line-height: 1;
      }

      &__title {
        font-size: var(--font-size-2xl);
        font-weight: 600;
      }

      &__message {
        color: var(--color-text-muted);
      }

      &__link {
        margin-top: var(--space-4);
        padding: var(--space-2) var(--space-6);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border);
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        transition:
          border-color var(--transition),
          color var(--transition),
          transform var(--transition);

        &:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
          transform: translateY(-1px);
        }
      }
    }
  `,
})
export class NotFound {
  protected readonly T = TEXTS;
}
