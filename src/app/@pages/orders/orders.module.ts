import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/@shared/shared.module';

import { OrdersRoutingModule } from './orders-routing.module';
import { OrdersComponent } from './orders.component';
import { LiveOrdersComponent } from './live-orders/live-orders.component';
import { OrderHistoryComponent } from './order-history/order-history.component';


@NgModule({
  declarations: [OrdersComponent, LiveOrdersComponent, OrderHistoryComponent],
  imports: [
    CommonModule,
    OrdersRoutingModule,
    SharedModule
  ]
})
export class OrdersModule { }
