import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/@shared/shared.module';
import { InventoryComponent } from './inventory.component';

import { InventoryRoutingModule } from './inventory-routing.module';
import { CreateInventoryItemComponent } from './create-inventory-item/create-inventory-item.component';


@NgModule({
  declarations: [InventoryComponent, CreateInventoryItemComponent],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    SharedModule
  ]
})
export class InventoryModule { }
