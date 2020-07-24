import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BusinessComponent } from './business.component';
import { CreateBusinessComponent } from './create-business/create-business.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: BusinessComponent
      },
      {
        path: 'create',
        component: CreateBusinessComponent
      },
      {
        path: ':id',
        component: CreateBusinessComponent
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BusinessRoutingModule { }
