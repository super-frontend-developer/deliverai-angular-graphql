import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';

import { VerifyUserRegistrationGQL } from '@app/@core/graphql/operations/user/mutation.ops.g';

@UntilDestroy({ arrayName: 'subscriptions' })
@Component({
  selector: 'app-verify-user',
  templateUrl: './verify-user.component.html',
  styleUrls: ['./verify-user.component.scss']
})
export class VerifyUserComponent implements OnInit {

  verificationCode = '';

  private readonly subscriptions = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private verifyUserRegistrationGQL: VerifyUserRegistrationGQL
  ) {
    this.activatedRoute.queryParams.subscribe(params => {
      this.verificationCode = params.vc;
    });
  }

  ngOnInit(): void {
  }

  activeEmail() {
    this.subscriptions.push(
      this.verifyUserRegistrationGQL
        .mutate({
          verificationCode: this.verificationCode
          }
        )
        .subscribe(result => {
          this.router.navigate([ '/auth/login' ]);
        })
    )
  }
}
