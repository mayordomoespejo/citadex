import { Component } from '@angular/core';

@Component({
  selector: 'app-page-layout',
  template: `<ng-content />`,
  styleUrl: './page-layout.scss',
  host: { class: 'page-layout' },
})
export class PageLayout {}
