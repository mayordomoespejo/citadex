import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';

import { SelectComponent, SelectOption } from './select';

const OPTIONS: SelectOption[] = [
  { value: 'alive', label: 'Alive' },
  { value: 'dead', label: 'Dead' },
  { value: 'unknown', label: 'Unknown' },
];

describe('SelectComponent', () => {
  let fixture: ComponentFixture<SelectComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectComponent);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show placeholder text when no value is selected', () => {
    const trigger = el.querySelector('.select__trigger');
    expect(trigger?.textContent).toContain('Select…');
  });

  it('should NOT render the dropdown initially', () => {
    expect(el.querySelector('[role="listbox"]')).toBeNull();
  });

  it('should open dropdown on button click', () => {
    el.querySelector<HTMLButtonElement>('.select__trigger')!.click();
    fixture.detectChanges();
    expect(el.querySelector('[role="listbox"]')).toBeTruthy();
  });

  it('should close dropdown on second button click (toggle)', () => {
    const trigger = el.querySelector<HTMLButtonElement>('.select__trigger')!;
    trigger.click();
    fixture.detectChanges();
    trigger.click();
    fixture.detectChanges();
    expect(el.querySelector('[role="listbox"]')).toBeNull();
  });

  it('should update selected label when an option is clicked', () => {
    el.querySelector<HTMLButtonElement>('.select__trigger')!.click();
    fixture.detectChanges();
    const options = el.querySelectorAll<HTMLElement>('[role="option"]');
    options[1].click(); // 'Dead'
    fixture.detectChanges();
    expect(el.querySelector('.select__value')?.textContent).toContain('Dead');
  });

  it('should close dropdown after selecting an option', () => {
    el.querySelector<HTMLButtonElement>('.select__trigger')!.click();
    fixture.detectChanges();
    el.querySelector<HTMLElement>('[role="option"]')!.click();
    fixture.detectChanges();
    expect(el.querySelector('[role="listbox"]')).toBeNull();
  });

  it('should open dropdown on ArrowDown key when closed', () => {
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(el.querySelector('[role="listbox"]')).toBeTruthy();
  });

  it('should close dropdown on Escape key', () => {
    el.querySelector<HTMLButtonElement>('.select__trigger')!.click();
    fixture.detectChanges();
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(el.querySelector('[role="listbox"]')).toBeNull();
  });

  it('should set aria-expanded true when open', () => {
    el.querySelector<HTMLButtonElement>('.select__trigger')!.click();
    fixture.detectChanges();
    const trigger = el.querySelector('.select__trigger');
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
  });

  it('should set aria-expanded false when closed', () => {
    const trigger = el.querySelector('.select__trigger');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
  });

  it('should mark selected option with aria-selected="true"', () => {
    fixture.componentInstance.writeValue('dead');
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('.select__trigger')!.click();
    fixture.detectChanges();
    const selected = el.querySelector('[aria-selected="true"]');
    expect(selected?.textContent?.trim()).toContain('Dead');
  });

  it('should NOT open when disabled', () => {
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('.select__trigger')!.click();
    fixture.detectChanges();
    expect(el.querySelector('[role="listbox"]')).toBeNull();
  });

  it('should apply aria-haspopup="listbox" on trigger', () => {
    const trigger = el.querySelector('.select__trigger');
    expect(trigger?.getAttribute('aria-haspopup')).toBe('listbox');
  });
});
