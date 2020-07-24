import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {Apollo} from 'apollo-angular';
import { CurrentUserBusinessStoreConnectionDocument } from '@app/@core/graphql/operations/business/query.ops.g';
import { CreateBusinessDocument } from '@app/@core/graphql/operations/business/mutation.ops.g';
import { UpdateBusinessDocument} from '@app/@core/graphql/operations/business/mutation.ops.g';
import { BusinessLookupByIdDocument } from '@app/@core/graphql/operations/business/query.ops.g';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy({ arrayName: 'subscriptions' })
@Component({
  selector: 'app-create-business',
  templateUrl: './create-business.component.html',
  styleUrls: ['./create-business.component.scss']
})
export class CreateBusinessComponent implements OnInit, OnDestroy {

  private readonly subscriptions = [];

  createBusinessForm: FormGroup;
  businessList: any[];
  businessId: any;
  isAddMode = true;
  business: any;
  isLoading = false;

  public file: File | null = null;
  defaultImage = 'assets/images/business-create-logo.svg';
  avatar: any;

  constructor(
    private apollo: Apollo,
    private activatedRoute: ActivatedRoute,
    private router: Router
    ) {

    const allParams = this.activatedRoute.snapshot.params;
		if (allParams && allParams.id !== undefined) {
      this.businessId = allParams.id;
			this.isAddMode = false;
    }
  }

  ngOnInit(): void {
    this.avatar = this.defaultImage;
    this.createBusinessForm = new FormGroup({
      id: new FormControl(''),
      business: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      website: new FormControl('')
    });
    if (!this.isAddMode) {
      this.businessDetail();
    }
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

  businessDetail() {
    this.subscriptions.push(
      this.apollo.watchQuery({
        query: BusinessLookupByIdDocument,
        variables: {
          id: this.businessId
        }
      }).valueChanges.subscribe((response: any) => {
        this.business = response.data.business;
        this.avatar = this.business.image ? this.business.image : this.defaultImage;
        this.createBusinessForm.setValue({
          id: this.business.id,
          business: this.business.name,
          description: this.business.description.longContent + ' ' + this.business.description.shortContent,
          website: this.business.website
        });
      })
    )
  }

  create() {
    this.isLoading = true;
    const formValue = this.createBusinessForm.value;

    this.subscriptions.push(
      this.apollo.mutate({
        mutation: CreateBusinessDocument,
        variables: {
          name: formValue.business,
          longContent: formValue.description,
          shortContent: '',
          website: formValue.website,
          image: this.file
        },
        context: {
          useMultipart: true
        },
        update: (store, {data}) => {
          let existingBusinessStoreConnections: any;
          let newBusinessData: any;
          existingBusinessStoreConnections = store.readQuery({ query: CurrentUserBusinessStoreConnectionDocument, variables: {} });
          newBusinessData = data;
          const newBusinessStoreConnection = {
            node: {
              business: newBusinessData.createBusiness
            }
          };
          existingBusinessStoreConnections.me.businessAssignmentConnection.edges.push(newBusinessStoreConnection);
          store.writeQuery({ query: CurrentUserBusinessStoreConnectionDocument, variables: {}, data: existingBusinessStoreConnections});
        }
      }).subscribe(() => {
        this.isLoading = false;
        this.createBusinessForm.reset();
        this.router.navigate([ '/business' ]);
      })
    )
  }

  update() {
    this.isLoading = true;
    const formValue = this.createBusinessForm.value;
    this.subscriptions.push(
      this.apollo.mutate({
        mutation: UpdateBusinessDocument,
        variables: {
          id: this.businessId,
          name: formValue.business,
          longContent: formValue.description,
          shortContent: '',
          website: formValue.website,
          image: this.file
        },
        context: {
          useMultipart: true
        },
        update: (store, {data}) => {
          let existingBusinessStoreConnections: any;
          let updatedBusinessData: any;
          existingBusinessStoreConnections = store.readQuery({ query: CurrentUserBusinessStoreConnectionDocument, variables: {} });
          updatedBusinessData = data;
          const updatedBusinessStoreConnection = {
            node: {
              business: updatedBusinessData.updateBusiness
            }
          };

          existingBusinessStoreConnections.me.businessAssignmentConnection.edges.push(updatedBusinessStoreConnection);
          store.writeQuery({ query: CurrentUserBusinessStoreConnectionDocument, variables: {}, data: existingBusinessStoreConnections});
        }
      }).subscribe(() => {
        this.isLoading = false;
        this.createBusinessForm.reset();
        this.router.navigate([ '/business' ]);
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
