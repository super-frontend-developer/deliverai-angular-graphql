import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { OrderDetailComponent } from '@app/@shared/modal/order-detail/order-detail.component';
import { Apollo, QueryRef } from 'apollo-angular';
import { LiveOrdersDocument } from '@app/@core/graphql/operations/order/subscription.ops.g';
import { StoreLookupByIdDocument } from '@app/@core/graphql/operations/store/query.ops.g';
import { StoreOrderConnectionDocument } from '@app/@core/graphql/operations/order/query.ops.g';
import { OrderDocument } from '@app/@core/graphql/operations/order/query.ops.g';
import { MoveOrderDocument } from '@app/@core/graphql/operations/order/mutation.ops.g';
import { CancelOrderDocument } from '@app/@core/graphql/operations/order/mutation.ops.g';

@Component({
  selector: 'app-live-orders',
  templateUrl: './live-orders.component.html',
  styleUrls: ['./live-orders.component.scss']
})
export class LiveOrdersComponent implements OnInit, OnDestroy {

  private readonly subscriptions = [];

  cancelOrderForm: FormGroup;

  liveOrdersQuery: QueryRef<any>;
  liveOrders: any[] = [];
  filteredLiveOrders: any[] = [];
  selectedOrder: any;
  targetQueueId: any;
  storeId: any;
  store: any;
  selectedOrderTab = null;
  orderFlow = null;
  loadingOrders: boolean;

  isOpenOrderDetail = false;
  refetch = true;

  constructor(public dialog: MatDialog,
    private modal: NgbModal,
    private apollo: Apollo) {
      this.storeId = localStorage.getItem('storeId');
    }

  ngOnInit(): void {
    this.loadingOrders = true;
    this.cancelOrderForm = new FormGroup({
      comment: new FormControl('', [Validators.required])
    });

    this.subscriptions.push(
      this.apollo.watchQuery({
        query: StoreLookupByIdDocument,
        variables: {
          id: this.storeId
        },
        fetchPolicy: 'no-cache'
      }).valueChanges.subscribe((response: any) => {
        this.store = response.data.store;
      })
    )

    this.liveOrdersQuery = this.apollo.watchQuery({
      query: StoreOrderConnectionDocument,
      variables: {
        id: this.storeId
      },
      fetchPolicy: this.refetch ? 'network-only' : 'cache-first'
    });

    this.subscriptions.push(
      this.liveOrdersQuery.valueChanges.subscribe(({data, loading}) => {
        this.refetch = false;
        this.orderFlow = data.store.orderFlow;
        this.selectedOrderTab = this.orderFlow.inputQueue;
        this.targetQueueId = +this.selectedOrderTab.id + 1;
        this.isOpenOrderDetail = false;
        this.liveOrders = [...data.store.orderConnection.edges];
        this.filteredLiveOrders = this.liveOrders.filter((orderItem: any) =>
        orderItem.node.fulfillment.queue.id === this.selectedOrderTab.id);
        this.selectedOrder = this.filteredLiveOrders[0];
        this.loadingOrders = loading;
      })
    )

    this.setupSubscription();
  }

  setupSubscription() {
    this.subscriptions.push(
      this.liveOrdersQuery.subscribeToMore({
        document: LiveOrdersDocument,
        variables: {
          store: this.storeId,
        },
        updateQuery: (prev, {subscriptionData}) => {
          if (!subscriptionData.data) {
            return prev;
          }

          const newOrder = {
            node: subscriptionData.data.order.order,
            __typename: 'OrderConnectionEdge'
          };
          this.orderFlow.inputQueue.orderConnection.totalCount =  this.orderFlow.inputQueue.orderConnection.totalCount + 1;

          prev.store.orderConnection.edges.push(newOrder);

          return prev;

        }
      })
    )
  }

  openOrderDetail(order: any): void {
    this.isOpenOrderDetail = true;
    this.selectedOrder = order;
    // const dialogConfig = new MatDialogConfig();
    // dialogConfig.width = '400px';
    // dialogConfig.panelClass = ['custom-modalbox'];

    // const dialogRef = this.dialog.open(OrderDetailComponent, dialogConfig);

    // dialogRef.afterClosed().subscribe(result => {
    // });
  }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }

  selectOrderTab(queue: any) {
    this.isOpenOrderDetail = false;
    this.selectedOrderTab = queue;
    this.targetQueueId = +this.selectedOrderTab.id + 1;
    this.filteredLiveOrders = this.liveOrders.filter((orderItem: any) => orderItem.node.fulfillment.queue.id === this.selectedOrderTab.id);
    this.selectedOrder = this.filteredLiveOrders[0];
  }

  getOrderType(type) {
    return (type === 'OrderPickupDelivery' ? 'Pickup' : 'Courier');
  }

  moveOrder(order: any) {
    this.subscriptions.push(
      this.apollo.mutate({
        mutation: MoveOrderDocument,
        variables: {
          id: order.node.id,
          targetQueue: this.targetQueueId + ''
        },
        refetchQueries: [{
          query: StoreOrderConnectionDocument,
          variables: {
            id: this.storeId
          }
        }]
      }).subscribe()
    )
  }

  cancelOrder(cancelOrderModal: TemplateRef<any>, order: any) {
    this.modal.open(cancelOrderModal).result.then((result)=>{
      const formValue = this.cancelOrderForm.value;
      if(result === 'okay') {
        this.subscriptions.push(
          this.apollo.mutate({
            mutation: CancelOrderDocument,
            variables: {
              id: order.node.id,
              comment: formValue.comment
            },
            refetchQueries: [{
              query: StoreOrderConnectionDocument,
              variables: {
                id: this.storeId
              }
            }]
          }).subscribe(() => {
            this.cancelOrderForm.reset();
          })
        )
      } else if(result === 'cancel') {
        this.cancelOrderForm.reset();
      }
    },
    ()=>{});
  }

  getCustomersNames(names: string[]) {
    let customersNames = '';
    let i = 0;
    for (const name of names) {
      i++;
      customersNames += name;
      if (i !== names.length) {
        customersNames += ', ';
      }
    }

    return customersNames;
  }

  getPaymentState(state: any) {
    if(state === 'NOT_PAID') {
      return 'NOT PAID'
    } else if(state === 'PAID') {
      return 'PAID'
    }
  }
}
