import { Component, OnInit, OnDestroy } from '@angular/core';
import { CurrentUserBusinessStoreConnectionDocument } from '@app/@core/graphql/operations/business/query.ops.g';
import {Apollo} from 'apollo-angular';

@Component({
  selector: 'app-business',
  templateUrl: './business.component.html',
  styleUrls: ['./business.component.scss']
})
export class BusinessComponent implements OnInit, OnDestroy {

  private readonly subscriptions = [];

  businessList: any[];

  constructor(private apollo: Apollo) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.apollo.watchQuery({
        query: CurrentUserBusinessStoreConnectionDocument,
        variables: {}
      }).valueChanges.subscribe((response: any) => {
        this.businessList = response.data.me.businessAssignmentConnection.edges;
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
