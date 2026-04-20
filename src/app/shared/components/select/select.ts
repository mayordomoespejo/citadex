import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon';

/** A single option in the select dropdown. */
export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Custom accessible select component that integrates with Angular reactive forms.
 * Implements `ControlValueAccessor` for seamless `formControlName` / `ngModel` usage.
 * Closes on outside click via a document-level host listener.
 */
@Component({
  selector: 'app-select',
  imports: [IconComponent],
  templateUrl: './select.html',
  styleUrl: './select.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent implements ControlValueAccessor {
  /** Available options to display in the dropdown. */
  readonly options = input.required<SelectOption[]>();
  readonly placeholder = input('Select…');

  private readonly host = inject(ElementRef);

  protected readonly isOpen = signal(false);
  protected readonly value = signal<string>('');
  protected readonly isDisabled = signal(false);
  protected readonly focusedIndex = signal(-1);

  protected readonly selectedLabel = computed(() => {
    const opt = this.options().find((o) => o.value === this.value());
    return opt ? opt.label : this.placeholder();
  });

  protected readonly hasValue = computed(() => this.value() !== '');

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  /** Toggles the dropdown open/closed, initializing keyboard focus to the currently selected option when opening. */
  protected toggle(): void {
    if (!this.isDisabled()) {
      const opening = !this.isOpen();
      this.isOpen.set(opening);
      if (opening) {
        const currentIdx = this.options().findIndex((o) => o.value === this.value());
        this.focusedIndex.set(currentIdx >= 0 ? currentIdx : 0);
      } else {
        this.focusedIndex.set(-1);
      }
    }
  }

  /** Commits the given option as the current value, notifies the form control, and closes the dropdown. */
  protected select(option: SelectOption): void {
    this.value.set(option.value);
    this.onChange(option.value);
    this.onTouched();
    this.isOpen.set(false);
    this.focusedIndex.set(-1);
  }

  /** Closes the dropdown when a click is detected outside the host element. */
  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (event.target && !this.host.nativeElement.contains(event.target as Node)) {
      this.isOpen.set(false);
      this.focusedIndex.set(-1);
    }
  }

  /** Handles keyboard navigation (Arrow keys, Enter/Space to select, Escape to close) for accessibility. */
  @HostListener('keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) return;

    const opts = this.options();

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        if (!this.isOpen()) {
          this.isOpen.set(true);
          const currentIdx = opts.findIndex((o) => o.value === this.value());
          this.focusedIndex.set(currentIdx >= 0 ? currentIdx : 0);
        } else {
          this.focusedIndex.update((i) => Math.min(i + 1, opts.length - 1));
        }
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        if (this.isOpen()) {
          this.focusedIndex.update((i) => Math.max(i - 1, 0));
        }
        break;
      }
      case 'Enter':
      case ' ': {
        event.preventDefault();
        if (!this.isOpen()) {
          this.isOpen.set(true);
          const currentIdx = opts.findIndex((o) => o.value === this.value());
          this.focusedIndex.set(currentIdx >= 0 ? currentIdx : 0);
        } else {
          const idx = this.focusedIndex();
          if (idx >= 0 && idx < opts.length) {
            this.select(opts[idx]);
          }
        }
        break;
      }
      case 'Escape': {
        event.preventDefault();
        this.isOpen.set(false);
        this.focusedIndex.set(-1);
        break;
      }
    }
  }

  /**
   * Sets the internal value from the form model.
   * Normalizes null/undefined to an empty string because this select only works with string values
   * and Reactive Forms may pass null on initialization or when the control is reset.
   */
  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.isDisabled.set(disabled);
  }
}
