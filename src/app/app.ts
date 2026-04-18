import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Header } from './layout/header/header';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/** Root component of the application. Calls `AuthService.init()` in `ngOnInit` to bootstrap authentication state. */
export class App implements OnInit {
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    this.authService.init();
  }
}
