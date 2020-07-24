import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '@app/@core/services/auth/auth.service';
import { UntilDestroy } from '@ngneat/until-destroy';
import { Router, ActivatedRoute } from '@angular/router';

import { TryResetUserPasswordGQL } from '@app/@core/graphql/operations/user/mutation.ops.g';

@UntilDestroy({ arrayName: 'subscriptions' })
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  isLoading = false;
  verificationCode = '';

  public readonly form = this.fb.group({
    newPassword: [ '', [ Validators.required ] ],
    confirmPassword: [ '', [ Validators.required ] ]
  });

  private readonly subscriptions = [];

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private tryResetUserPasswordGQL: TryResetUserPasswordGQL) {

    this.activatedRoute.queryParams.subscribe(params => {
      this.verificationCode = params.vc;
    });
  }

  ngOnInit(): void {
  }

  submit() {
    if (!this.form.valid) {
      return;
    }

    this.isLoading = true;

    const formValue = this.form.value;

    this.subscriptions.push(
      this.tryResetUserPasswordGQL
        .mutate({
          verificationCode: this.verificationCode,
          newPassword: formValue.newPassword,
          newPasswordConfirmation: formValue.confirmPassword
          }
        )
        .subscribe(result => {
          this.isLoading = false;
          this.router.navigateByUrl('/auth/login');
        })
    )
  }

}
