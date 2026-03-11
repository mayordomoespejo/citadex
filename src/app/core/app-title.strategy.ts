import { Injectable } from '@angular/core';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

/**
 * Custom title strategy that appends "| Citadex" to every route title.
 * Falls back to "Citadex" when no title is defined for the active route.
 *
 * @example
 * // Route with title: 'Characters' → "Characters | Citadex"
 * // Route without title → "Citadex"
 */
@Injectable({ providedIn: 'root' })
export class AppTitleStrategy extends TitleStrategy {
  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot);
    document.title = title ? `${title} | Citadex` : 'Citadex';
  }
}
