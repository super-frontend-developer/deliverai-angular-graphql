import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-email-check',
  templateUrl: './email-check.component.html',
  styleUrls: ['./email-check.component.scss']
})
export class EmailCheckComponent implements OnInit {

  path = null;

  constructor(private router: Router) {
    this.path = this.router.getCurrentNavigation().extras.state.path;
  }

  ngOnInit(): void {

  }

  redirect() {
    this.router.navigate([ '/auth/login' ]);
  }
}
