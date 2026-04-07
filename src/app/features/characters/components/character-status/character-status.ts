import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Character } from '../../models/character.model';

/** Renders the status indicator dot alongside the character's status and species. */
@Component({
  selector: 'app-character-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './character-status.html',
  styleUrl: './character-status.scss',
})
export class CharacterStatus {
  /** The character whose status and species are displayed. */
  readonly character = input.required<Character>();
}
