import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateStoreComponent } from './create-store.component';
import { StoreDetailsComponent } from './store-details/store-details.component';
import { DeliveryZoneComponent } from './delivery-zone/delivery-zone.component';
import { PlansPricingComponent } from './plans-pricing/plans-pricing.component';
import { ServiceOperatingHoursComponent } from './service-operating-hours/service-operating-hours.component';

const routes: Routes = [
  {
    path: '',
    component: CreateStoreComponent,
    children: [
      {
        path: '', redirectTo: 'store-details'
      },
      {
        path: 'store-details',
        component: StoreDetailsComponent
      },
      {
        path: 'plans-pricing',
        component: PlansPricingComponent
      },
      {
        path: 'service-operating-hours',
        component: ServiceOperatingHoursComponent
      },
      {
        path: 'delivery-zone',
        component: DeliveryZoneComponent
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateStoreRoutingModule { }
