import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContactsComponent } from './contacts/contacts.component';
import { CustomersComponent } from './customers/customers.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '', redirectTo: 'customers', pathMatch: 'full'
      },
      {
        path: 'customers',
        component: CustomersComponent
      },
      {
        path: 'contacts',
        component: ContactsComponent
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CrmRoutingModule { }
