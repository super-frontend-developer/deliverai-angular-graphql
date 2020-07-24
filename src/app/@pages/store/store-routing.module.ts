import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StoreComponent } from './store.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: StoreComponent
      },
      {
        path: 'create',
        loadChildren: () => import('./create-store/create-store.module').then(m => m.CreateStoreModule)
      },
      {
        path: ':id',
        loadChildren: () => import('./create-store/create-store.module').then(m => m.CreateStoreModule)
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StoreRoutingModule { }
