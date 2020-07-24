import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InventoryComponent } from './inventory.component';
import { CreateInventoryItemComponent } from './create-inventory-item/create-inventory-item.component';


const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: InventoryComponent
      },
      {
        path: 'create',
        component: CreateInventoryItemComponent
      },
      {
        path: ':id',
        component: CreateInventoryItemComponent
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }
