import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { TEXTS } from '../../shared/i18n/texts';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected readonly T = TEXTS;
}
