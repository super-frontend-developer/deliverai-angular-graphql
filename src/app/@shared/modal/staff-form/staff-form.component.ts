import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {Apollo} from 'apollo-angular';
import { BusinessInviteUserDocument } from '@app/@core/graphql/operations/staff/mutation.ops.g';
import { BusinessAssignUserDocument } from '@app/@core/graphql/operations/staff/mutation.ops.g';
import { BusinessAssignmentDocument } from '@app/@core/graphql/operations/staff/query.ops.g';
import { BusinessLookupByIdDocument } from '@app/@core/graphql/operations/business/query.ops.g';
@Component({
  selector: 'app-staff-form',
  templateUrl: './staff-form.component.html',
  styleUrls: ['./staff-form.component.scss']
})
export class StaffFormComponent implements OnInit, OnDestroy {

  private readonly subscriptions = [];

  staffId: any;
  businessId: any;
  staff: any;
  staffForm: FormGroup;
  staffsList: any[];
  isAddMode = false;

  avatarUrl = 'assets/images/avatar.png';
  createdAt = '28 Feb, 2015, 06:00 PM';

  constructor(
    public dialogRef: MatDialogRef<StaffFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apollo: Apollo
  ) {
    this.staffId = data.id;
    this.businessId = data.businessId;
    this.isAddMode = data.isAddMode;

    if (this.staffId) {
      this.staffDetails();
    }
  }

  ngOnInit(): void {
    this.staffForm = new FormGroup({
      id: new FormControl(''),
      first_name: new FormControl('', [Validators.required, Validators.maxLength(10)]),
      last_name: new FormControl('', [Validators.required, Validators.maxLength(30)]),
      email: new FormControl('', [Validators.required, Validators.maxLength(60)]),
      role: new FormControl('', [Validators.required])
    });
  }

  staffDetails() {
    this.apollo.watchQuery({
      query: BusinessAssignmentDocument,
      variables: {
        id: this.staffId
      }
    }).valueChanges.subscribe((response: any) => {
    })
  }

  cancel() {
    this.dialogRef.close();
    this.staffForm.reset();
  }

  update() {
    const index = this.staffsList.findIndex(item => item.id === this.staffId);
    const updatedStaff = {
      id: this.staffId,
      first_name: this.staffForm.get('first_name').value,
      last_name: this.staffForm.get('last_name').value,
      avatar: this.staff.avatar,
      email: this.staffForm.get('email').value,
      role: this.staffForm.get('role').value,
      created_at: this.staff.created_at
    }
    this.dialogRef.close();
    this.staffForm.reset();
  }

  create () {
    this.subscriptions.push(
      this.apollo.mutate({
        mutation: BusinessInviteUserDocument,
        variables: {
          business: this.businessId,
          email: this.staffForm.get('email').value,
          roles: [this.staffForm.get('role').value],
        },
        refetchQueries: [{
          query: BusinessLookupByIdDocument,
          variables: {
            id: this.businessId
          }
        }]
      }).subscribe(() => {
        this.dialogRef.close();
        this.staffForm.reset();
      })
    )
  }

  // update() {
  //   const formValue = this.createBusinessForm.value;
  //   this.subscriptions.push(
  //     this.updateBusinessGQL
  //       .mutate({
  //         id: this.businessId,
  //         name: formValue.business,
  //         longContent: formValue.description,
  //         shortContent: '',
  //         website: formValue.website,
  //       })
  //       .subscribe(result => {
  //         this.router.navigate([ '/business' ]);
  //       })
  //   )
  // }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }
}
