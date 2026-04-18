import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component } from '@angular/core';

import { PageLayout } from './page-layout';

@Component({
  template: `<app-page-layout><p class="slot-content">hello</p></app-page-layout>`,
  imports: [PageLayout],
  standalone: true,
})
class TestHostComponent {}

describe('PageLayout', () => {
  let fixture: ComponentFixture<PageLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(PageLayout);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should apply host class page-layout', () => {
    expect(fixture.nativeElement.classList.contains('page-layout')).toBe(true);
  });

  it('should project slot content via ng-content', async () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
    const slotContent = hostFixture.nativeElement.querySelector('.slot-content');
    expect(slotContent).toBeTruthy();
    expect(slotContent.textContent.trim()).toBe('hello');
  });

  it('should render as a block element with page-layout class', () => {
    expect(fixture.nativeElement.className).toContain('page-layout');
  });
});
