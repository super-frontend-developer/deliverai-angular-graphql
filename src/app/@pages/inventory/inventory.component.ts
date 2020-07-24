import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import { BusinessCatalogProductConnectionDocument } from '@app/@core/graphql/operations/catalog/query.ops.g';
import { UpdateCatalogProductDocument } from '@app/@core/graphql/operations/catalog/mutation.ops.g';
import {Apollo} from 'apollo-angular';
import { CatalogDocument } from '@app/@core/graphql/operations/catalog/query.ops.g';

declare var $: any;

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit, OnDestroy {

  private readonly subscriptions = [];

  inventoryProductList: any[] = [];
  storeId: any;
  businessId: any;
  loadingProducts: any;

  constructor(
    public apollo: Apollo
  ) {
    this.storeId = localStorage.getItem('storeId');
    this.businessId = localStorage.getItem('businessId');
  }

  ngOnInit(): void {
    this.loadingProducts = true;

    this.subscriptions.push(
      this.apollo.watchQuery({
        query: BusinessCatalogProductConnectionDocument,
        variables: {
          id: this.businessId
        },
        fetchPolicy: 'no-cache'
      }).valueChanges.subscribe((response: any) => {
        let catalogList: any[] = [];
        this.inventoryProductList = [];
        catalogList = response.data.business.catalogConnection.edges;
        for (const catalog of catalogList) {
          this.subscriptions.push(
            this.apollo.watchQuery({
              query: CatalogDocument,
              variables: {id: catalog.node.id},
            }).valueChanges.subscribe()
          )
          for (const catalogProduct of catalog.node.productConnection.edges) {
            this.inventoryProductList.push(catalogProduct);
          }
        }
        this.loadingProducts = response.loading;
      })
    )

    $.getScript('./assets/js/customizer.js');
  }

  search(event: Event) {
  }

  onChange(value: boolean, productId: any) {
    this.subscriptions.push(
      this.apollo.mutate({
        mutation: UpdateCatalogProductDocument,
        variables: {
          product: productId,
          hidden: !value
        }
      }).subscribe(() => {
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


