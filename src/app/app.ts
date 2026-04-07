import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Header } from './layout/header/header';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
/** Root component of the application. Calls `AuthService.init()` in the constructor to bootstrap authentication state before any route renders. */
export class App {
  constructor() {
    inject(AuthService).init();
  }
}
