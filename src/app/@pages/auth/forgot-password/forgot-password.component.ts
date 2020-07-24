import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { UntilDestroy } from '@ngneat/until-destroy';

import { RequestResetUserPasswordGQL } from '@app/@core/graphql/operations/user/mutation.ops.g';

@UntilDestroy({ arrayName: 'subscriptions' })
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: [ './forgot-password.component.scss' ]
})
export class ForgotPasswordComponent implements OnInit {

  isLoading = false;

  public readonly form = this.fb.group({
    email: [ '', [ Validators.email, Validators.required ] ]
  });

  private readonly subscriptions = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private requestResetUserPasswordGQL: RequestResetUserPasswordGQL
    ) {
  }

  ngOnInit() {
  }

  submit() {
    if (!this.form.valid) {
      return;
    }

    this.isLoading = true;

    const formValue = this.form.value;
    this.subscriptions.push(
      this.requestResetUserPasswordGQL
        .mutate({
            email: formValue.email
          }
        )
        .subscribe(result => {
          this.isLoading = false;
          this.router.navigateByUrl('/auth/forgot-password/success', { state: { path: 'reset' } });
        })
    )
  }

}
