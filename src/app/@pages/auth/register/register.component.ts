import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CreateUserGQL } from '@app/@core/graphql/operations/user/mutation.ops.g';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy({ arrayName: 'subscriptions' })
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: [ './register.component.scss' ]
})
export class RegisterComponent implements OnInit {
  isLoading = false;

  public readonly form = this.fb.group({
    name: this.fb.group({
      given: [ '', [ Validators.required, ] ],
      family: [ '', [ Validators.required ] ],
    }),
    email: [ '', [ Validators.required, Validators.email ] ],
    password: [ '', [ Validators.required ] ]
  });

  private readonly subscriptions = [];

  constructor(private fb: FormBuilder,
              private router: Router,
              private createUserGQL: CreateUserGQL) {
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
      this.createUserGQL
        .mutate({
            givenName: formValue.name.given,
            familyName: formValue.name.family,
            email: formValue.email,
            password: formValue.password
          }
        )
        .subscribe(result => {
          this.isLoading = false;
          this.router.navigateByUrl('/auth/registration/success', { state: { path: 'verify' } });
        })
    )
  }

}
