import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {Apollo} from 'apollo-angular';

import { CurrentUserBusinessStoreConnectionDocument } from '@app/@core/graphql/operations/business/query.ops.g';
import { CreateStoreDocument } from '@app/@core/graphql/operations/store/mutation.ops.g';
import { UpdateStoreDocument } from '@app/@core/graphql/operations/store/mutation.ops.g';
import { StoreLookupByIdGQL } from '@app/@core/graphql/operations/store/query.ops.g';
import { GetTimeZoneListGQL } from '@app/@core/graphql/operations/general/query.ops.g';
import { CreateStoreAddressDocument } from '@app/@core/graphql/operations/store/mutation.ops.g';
import { UpdateStoreAddressDocument } from '@app/@core/graphql/operations/store/mutation.ops.g';

@Component({
  selector: 'app-store-details',
  templateUrl: './store-details.component.html',
  styleUrls: ['./store-details.component.scss']
})
export class StoreDetailsComponent implements OnInit, OnDestroy {

  private readonly subscriptions = [];

  createStoreForm: FormGroup;
  storesList: any[];
  timezoneList: any[];
  storeId: any;
  businessId: any;
  isAddMode = true;
  isLoading = false;
  store: any;

  public file: File | null = null;
  defaultImage = 'assets/images/business-create-logo.svg';
  avatar: any;

  constructor(
    private apollo: Apollo,
    private storeLookupByIdGQL: StoreLookupByIdGQL,
    private getTimeZoneListGQL: GetTimeZoneListGQL,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.activatedRoute.parent.params.subscribe(params => {
      if (params && params.id !== undefined) {
        this.storeId = params.id;
        this.isAddMode = false;
      }
    });

    if (this.router.getCurrentNavigation().extras.state !== undefined) {
      this.businessId = this.router.getCurrentNavigation().extras.state.businessId;
    }
  }

  ngOnInit(): void {
    this.avatar = this.defaultImage;
    this.createStoreForm = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      address: new FormControl(''),
      city: new FormControl(''),
      country: new FormControl(''),
      timezone: new FormControl('', [Validators.required])
    });

    this.getTimeZoneList();

    if (!this.isAddMode) {
      this.storeDetail();
    }
  }

  storeDetail() {
    this.subscriptions.push(
      this.storeLookupByIdGQL.watch({ id: this.storeId})
      .valueChanges.subscribe(result => {
        this.store = result.data.store;
        this.avatar = this.store.image ? this.store.image : this.defaultImage;
        this.createStoreForm.setValue({
          id: this.store.id,
          name: this.store.name,
          description: this.store.description.longContent + ' ' + this.store.description.shortContent,
          address: this.store.address.addressLine1,
          city: this.store.address.city,
          country: this.store.address.country,
          timezone: this.store.timeZone.id
        });
      })
    )
  }

  getTimeZoneList() {
    this.subscriptions.push(
      this.getTimeZoneListGQL.watch()
      .valueChanges.subscribe(result => {
        this.timezoneList = result.data.timeZones;
      })
    )
  }

  create() {
    this.isLoading = true;
    const formValue = this.createStoreForm.value;
    this.subscriptions.push(
      this.apollo.mutate({
        mutation: CreateStoreDocument,
        variables: {
          business: this.businessId,
          name: formValue.name,
          longContent: formValue.description,
          shortContent: '',
          timeZone: formValue.timezone,
          image: this.file
        },
        context: {
          useMultipart: true
        }
      }).subscribe((response: any) => {
        this.apollo.mutate({
          mutation: CreateStoreAddressDocument,
          variables: {
            store: response.data.createStore.id,
            country: formValue.country,
            city: formValue.city,
            addressLine1: formValue.address
          },
          refetchQueries: [{
            query: CurrentUserBusinessStoreConnectionDocument,
            variables: {}
          }]
        }).subscribe(() => {
          this.isLoading = false;
          this.createStoreForm.reset();
          this.router.navigate([ '/store' ]);
        })
      })
    )
  }

  update() {
    this.isLoading = true;
    const formValue = this.createStoreForm.value;
    this.subscriptions.push(
      this.apollo.mutate({
        mutation: UpdateStoreDocument,
        variables: {
          id: this.storeId,
          name: formValue.name,
          longContent: formValue.description,
          shortContent: '',
          timeZone: formValue.timezone,
          image: this.file
        },
        context: {
          useMultipart: true
        }
      }).subscribe((response: any) => {

        this.apollo.mutate({
          mutation: UpdateStoreAddressDocument,
          variables: {
            id: response.data.updateStore.address.id,
            country: formValue.country,
            city: formValue.city,
            addressLine1: formValue.address
          },
          refetchQueries: [{
            query: CurrentUserBusinessStoreConnectionDocument,
            variables: {}
          }]
        }).subscribe(() => {
          this.isLoading = false;
          this.createStoreForm.reset();
          this.router.navigate([ '/store' ]);
        })
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

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }

}
