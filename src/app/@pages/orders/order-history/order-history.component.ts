import { Component, OnInit } from '@angular/core';
import { BusinessOrderConnectionDocument } from '@app/@core/graphql/operations/order/query.ops.g';
import { Apollo, QueryRef } from 'apollo-angular';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss']
})
export class OrderHistoryComponent implements OnInit {

  private readonly subscriptions = [];

  orderHistory: any[] = [];
  storeId: any;
  businessId: any;
  loadingOrders: boolean;

  constructor(
    private apollo: Apollo) {
    this.businessId = localStorage.getItem('businessId');
  }

  ngOnInit(): void {
    this.loadingOrders = true;
    this.subscriptions.push(
      this.apollo.watchQuery({
        query: BusinessOrderConnectionDocument,
        variables: {
          id: this.businessId
        },
        fetchPolicy: 'no-cache'
      }).valueChanges.subscribe((result: any) => {
        this.orderHistory = result.data.business.orderConnection.edges;
        this.orderHistory = this.orderHistory.filter((orderItem: any) => {
          return (orderItem.node.fulfillment.state === 'COMPLETED' || orderItem.node.fulfillment.state === 'CANCELLED')
        })
        this.loadingOrders = result.loading;
      })
    )
  }

  getOrderType(type) {
    return (type === 'OrderPickupDelivery' ? 'Pickup' : 'Courier');
  }
}
