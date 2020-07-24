import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {Apollo} from 'apollo-angular';
import { Router, ActivatedRoute } from '@angular/router';
import { CurrentUserDocument } from '@app/@core/graphql/operations/user/query.ops.g';
import { UpdateUserDocument } from '@app/@core/graphql/operations/user/mutation.ops.g';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit {

  private readonly subscriptions = [];

  accountForm: FormGroup;
  currentUser: any;
  currentUserId: any;
  isLoading = false;

  public file: File | null = null;
  avatar = '/assets/images/add_photo.svg';
  hasDragOver = false;

  constructor(
    private apollo: Apollo,
    private router: Router) { }

  ngOnInit(): void {
    this.accountForm = new FormGroup({
      id: new FormControl(''),
      first_name: new FormControl('', [Validators.required, Validators.maxLength(10)]),
      last_name: new FormControl('', [Validators.required, Validators.maxLength(30)]),
      email: new FormControl('', [Validators.required, Validators.maxLength(60)])
    });

    this.subscriptions.push(
      this.apollo.watchQuery({
        query: CurrentUserDocument,
        variables: {}
      }).valueChanges.subscribe((response: any) => {
        this.currentUser = response.data.me;
        if (this.currentUser.avatar !== undefined && this.currentUser.avatar !== null) {
          this.avatar = this.currentUser.avatar;
        }
        this.currentUserId = this.currentUser.id;
        this.accountForm.patchValue({
          id: this.currentUser.id,
          first_name: this.currentUser.name.given,
          last_name: this.currentUser.name.family,
          email: this.currentUser.email
        });
      })
    )
  }

  cancel() {
    this.router.navigate([ 'dashboard' ]);
  }

  save() {
    this.isLoading = true;

    const formValue = this.accountForm.value;

    this.subscriptions.push(
      this.apollo.mutate({
        mutation: UpdateUserDocument,
        variables: {
          id: this.currentUserId,
          givenName: formValue.first_name,
          familyName: formValue.last_name,
          email: formValue.email,
          avatar: this.file,
        },
        context: {
          useMultipart: true
        },
        refetchQueries: [{
          query: CurrentUserDocument,
          variables: {}
        }]
      }).subscribe((response: any) => {
        localStorage.setItem('avatar', response.data.updateUser.avatar);
        this.isLoading = false;
        this.router.navigate([ 'dashboard' ]);
      })
    )
  }

  onFileChange(event) {
    const reader = new FileReader();
    if(event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      this.file = file;
      // tslint:disable-next-line:no-shadowed-variable
      reader.onload = (event: any) => {
        this.avatar = event.target.result;
      }
      reader.readAsDataURL(this.file);
    }
  }
}
