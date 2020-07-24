import { Component, OnInit, ElementRef, HostListener, Input, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CreateInventoryProductDocument } from '@app/@core/graphql/operations/inventory/mutation.ops.g';
import { InventoryProductConnectionDocument } from '@app/@core/graphql/operations/inventory/query.ops.g';
import { GetCurrencyListGQL } from '@app/@core/graphql/operations/general/query.ops.g';
import {Apollo} from 'apollo-angular';

@Component({
  selector: 'app-create-inventory-item',
  templateUrl: './create-inventory-item.component.html',
  styleUrls: ['./create-inventory-item.component.scss']
})
export class CreateInventoryItemComponent implements OnInit, OnDestroy {

  private readonly subscriptions = [];

  createItemForm: FormGroup;
  currencyList: any[];
  businessId: any;
  storeId: any;

  constructor(private host: ElementRef<HTMLInputElement>,
    private getCurrencyListGQL: GetCurrencyListGQL,
    public apollo: Apollo,
    private router: Router) {
      this.businessId = localStorage.getItem('businessId');
      this.storeId = localStorage.getItem('storeId');
    }

  ngOnInit(): void {
    this.createItemForm = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('', [Validators.required]),
      price: new FormControl('', [Validators.required]),
      currency: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required])
    });

    this.getCurrencyList();
  }

  cancel() {
    this.router.navigate([ 'inventory' ]);
  }

  save() {
    const formValue = this.createItemForm.value;
    this.subscriptions.push(
      this.apollo.mutate({
        mutation: CreateInventoryProductDocument,
        variables: {
          business: this.businessId,
          name: formValue.name,
          description: formValue.description
        },
        refetchQueries: [{
          query: InventoryProductConnectionDocument,
          variables: {store: this.storeId}
        }]
      }).subscribe(() => {
        this.createItemForm.reset();
        this.router.navigate([ 'inventory' ]);
      })
    )
  }

  getCurrencyList() {
    this.subscriptions.push(
      this.getCurrencyListGQL.watch()
      .valueChanges.subscribe(result => {
        this.currencyList = result.data.currencies;
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
