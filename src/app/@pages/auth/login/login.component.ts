import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '@app/@core/services/auth/auth.service';
import { UntilDestroy } from '@ngneat/until-destroy';
import { flatMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';

@UntilDestroy({ arrayName: 'subscriptions' })
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: [ './login.component.scss' ]
})
export class LoginComponent implements OnInit, OnDestroy {

  isLoading = false;
  showErrorMessage = false;

  public readonly form = this.fb.group({
    email: [ '', [ Validators.email, Validators.required ] ],
    password: [ '', [ Validators.required ] ],
    rememberMe: [ false, Validators.required ],
  });

  private readonly subscriptions = [];

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private router: Router,
              public apollo: Apollo) {
  }

  ngOnInit() {
    this.subscriptions.push(

    )
  }

  submit() {

    if (!this.form.valid) {
      return;
    }

    this.isLoading = true;
    this.showErrorMessage = false;

    const formValue = this.form.value;
    this.subscriptions.push(
      this.authService.login$(formValue.email, formValue.password, formValue.rememberMe)
        .subscribe((result) => {
          this.isLoading = false;
          this.router.navigate([ '/' ])
        },
        (error) => {
          this.isLoading = false;
          this.showErrorMessage = true;
        })
    )
  }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }
}
