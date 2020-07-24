import { Component, OnInit, OnDestroy } from '@angular/core';
import { CurrentUserBusinessStoreConnectionDocument } from '@app/@core/graphql/operations/business/query.ops.g';
import {Apollo} from 'apollo-angular';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss']
})
export class StoreComponent implements OnInit, OnDestroy {

  private readonly subscriptions = [];
  businessId: any;
  businessList: any[];
  storeConnection: any;

  constructor(private apollo: Apollo,
    private router: Router) {
      if (this.router.getCurrentNavigation().extras.state !== undefined) {
        this.businessId = this.router.getCurrentNavigation().extras.state.businessId;
      }
   }

  ngOnInit(): void {
    this.subscriptions.push(
      this.subscriptions.push(
        this.apollo.watchQuery({
          query: CurrentUserBusinessStoreConnectionDocument,
          variables: {},
          fetchPolicy: 'no-cache'
        }).valueChanges.subscribe((response: any) => {
          this.businessList = response.data.me.businessAssignmentConnection.edges;
          if (this.businessId !== undefined) {
            this.businessList = this.businessList.filter((business: any) => business.node.business.id === this.businessId)
          }
        })
      )
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
