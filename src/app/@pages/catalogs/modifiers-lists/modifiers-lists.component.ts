import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-modifiers',
  templateUrl: './modifiers-lists.component.html',
  styleUrls: ['./modifiers-lists.component.scss']
})
export class ModifiersListsComponent implements OnInit {
  type = 'all';
  sm = 'd-lg-none';
  lg = 'd-none d-lg-table-cell';

  constructor() { }

  ngOnInit(): void {
  }

}
