import { Component, OnInit } from '@angular/core';
import { CurrentUserBusinessStoreConnectionDocument } from '@app/@core/graphql/operations/business/query.ops.g';
import { Apollo } from 'apollo-angular';

@Component({
  selector: 'app-business-store-dropdown',
  templateUrl: './business-store-dropdown.component.html',
  styleUrls: ['./business-store-dropdown.component.scss']
})
export class BusinessStoreDropdownComponent implements OnInit {

  private readonly subscriptions = [];

  businessList: any[];
  selectedBusinessStore: any;

  constructor(public apollo: Apollo) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.apollo.watchQuery({
        query: CurrentUserBusinessStoreConnectionDocument,
        variables: {},
        fetchPolicy: 'no-cache',
      }).valueChanges.subscribe((response: any) => {
        this.businessList = response.data.me.businessAssignmentConnection.edges;
      })
    )

    this.selectedBusinessStore = (localStorage.getItem('businessName') || localStorage.getItem('storeName')) ? (localStorage.getItem('businessName') || localStorage.getItem('storeName')) : 'Select a store';
  }

  selectBusiness(business: any) {
    localStorage.setItem('businessId', business.node.business.id);
    localStorage.setItem('businessName', business.node.business.name);
    localStorage.setItem('storeId', '');
    localStorage.setItem('storeName', '');

    const storeIds = [];
    for (const store of business.node.business.storeConnection.edges) {
      storeIds.push(store.node.id);
    }

    localStorage.setItem('storeIds', JSON.stringify(storeIds));
    this.selectedBusinessStore = localStorage.getItem('businessName');

  }

  selectStore(store: any, business: any) {
    localStorage.setItem('businessId', business.node.business.id);
    localStorage.setItem('businessName', '');
    localStorage.setItem('storeId', store.node.id);
    localStorage.setItem('storeName', store.node.name);

    const storeIds = [];
    // tslint:disable-next-line:no-shadowed-variable
    for (const store of business.node.business.storeConnection.edges) {
      storeIds.push(store.node.id);
    }

    localStorage.setItem('storeIds', JSON.stringify(storeIds));

    this.selectedBusinessStore = localStorage.getItem('storeName');
  }
}
