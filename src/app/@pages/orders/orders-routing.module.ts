import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LiveOrdersComponent } from './live-orders/live-orders.component';
import { OrderHistoryComponent } from './order-history/order-history.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '', redirectTo: 'live-orders', pathMatch: 'full'
      },
      {
        path: 'live-orders',
        component: LiveOrdersComponent
      },
      {
        path: 'order-history',
        component: OrderHistoryComponent
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule { }
