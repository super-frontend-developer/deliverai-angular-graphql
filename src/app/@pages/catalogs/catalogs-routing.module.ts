import { NgModule } from '@angular/core';
import { Routes, RouterModule, ActivatedRouteSnapshot } from '@angular/router';
import { CatalogsComponent } from './catalogs.component';
import { ItemsModifiersComponent } from './items-modifiers/items-modifiers.component';
import { ModifiersListsComponent } from './modifiers-lists/modifiers-lists.component';
import { ModifiersDetailComponent } from './modifiers-detail/modifiers-detail.component';
import { CreateItemComponent } from './create-item/create-item.component';
import { MenuComponent } from './menu/menu.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: CatalogsComponent
      },
      {
        path: 'items-modifiers',
        component: ItemsModifiersComponent
      },
      {
        path: 'modifiers-lists',
        component: ModifiersListsComponent
      },
      {
        path: 'modifiers-detail',
        component: ModifiersDetailComponent
      },
      {
        path: 'create-item',
        component: CreateItemComponent
      },
      {
        path: ':catalogId',
        component: MenuComponent
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CatalogsRoutingModule { }
