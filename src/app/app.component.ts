import { Component, OnInit } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { Store, select } from '@ngrx/store';
import { fadeAnimation } from './app-route-animation';
@UntilDestroy({ arrayName: 'subscriptions' })
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ],
  animations: [fadeAnimation]
})
export class AppComponent implements OnInit {

  private readonly subscriptions = [];
  constructor() {
  }

  ngOnInit(): void {
  }
}
