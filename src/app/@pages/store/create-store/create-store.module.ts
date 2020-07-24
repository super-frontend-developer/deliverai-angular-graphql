import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/@shared/shared.module';
import { AgmCoreModule, GoogleMapsAPIWrapper } from '@agm/core';

import { CreateStoreRoutingModule } from './create-store-routing.module';
import { CreateStoreComponent } from './create-store.component';
import { StoreDetailsComponent } from './store-details/store-details.component';
import { DeliveryZoneComponent } from './delivery-zone/delivery-zone.component';
import { PlansPricingComponent } from './plans-pricing/plans-pricing.component';
import { ServiceOperatingHoursComponent } from './service-operating-hours/service-operating-hours.component';


@NgModule({
  declarations: [
    CreateStoreComponent,
    StoreDetailsComponent,
    DeliveryZoneComponent,
    PlansPricingComponent,
    ServiceOperatingHoursComponent
  ],
  imports: [
    CommonModule,
    CreateStoreRoutingModule,
    SharedModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyB4tqFq6eLwPZMF3ZFNsQswGPg0Q0czRpc',
      libraries: ['places', 'drawing', 'geometry']
    }),
  ],
  providers: [
	  GoogleMapsAPIWrapper
  ]
})
export class CreateStoreModule { }
