import { Component, input, signal } from '@angular/core';

/**
 * Displays a user avatar: shows the photo URL when valid,
 * falls back to the first initial when the image fails or no URL is provided.
 *
 * @input photoURL  - Optional photo URL. Pass `null` to always show the initial.
 * @input initial   - Single character shown when photo is unavailable.
 * @input size      - Visual size variant: 'sm' = 32px (header), 'md' = 88px (profile).
 */
@Component({
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.html',
  styleUrl: './user-avatar.scss',
  host: {
    class: 'user-avatar',
    '[attr.data-size]': 'size()',
  },
})
export class UserAvatar {
  readonly photoURL = input<string | null>(null);
  readonly initial = input.required<string>();
  readonly size = input<'sm' | 'md'>('sm');

  protected readonly imageError = signal(false);
  protected onImageError(): void {
    this.imageError.set(true);
  }
}
