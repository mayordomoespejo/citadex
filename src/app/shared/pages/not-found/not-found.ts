import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TEXTS } from '../../i18n/texts';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound {
  protected readonly T = TEXTS;
}
