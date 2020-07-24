import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/@shared/shared.module';

import { BusinessRoutingModule } from './business-routing.module';
import { BusinessComponent } from './business.component';
import { CreateBusinessComponent } from './create-business/create-business.component';
import { BusinessCardComponent } from './business-card/business-card.component';

@NgModule({
  declarations: [BusinessComponent, CreateBusinessComponent, BusinessCardComponent],
  imports: [
    CommonModule,
    BusinessRoutingModule,
    SharedModule
  ]
})
export class BusinessModule { }
