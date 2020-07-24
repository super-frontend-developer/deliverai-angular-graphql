import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/@shared/shared.module';

import { CatalogsRoutingModule } from './catalogs-routing.module';
import { CatalogsComponent } from './catalogs.component';
import { ItemsModifiersComponent } from './items-modifiers/items-modifiers.component';
import { ModifiersListsComponent } from './modifiers-lists/modifiers-lists.component';
import { ModifiersDetailComponent } from './modifiers-detail/modifiers-detail.component';
import { CreateItemComponent } from './create-item/create-item.component';
import { MenuComponent } from './menu/menu.component';


@NgModule({
  declarations: [
    CatalogsComponent,
    ItemsModifiersComponent,
    ModifiersListsComponent,
    ModifiersDetailComponent,
    CreateItemComponent,
    MenuComponent
  ],
  imports: [
    CommonModule,
    CatalogsRoutingModule,
    SharedModule
  ]
})
export class CatalogsModule { }
