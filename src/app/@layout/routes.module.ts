import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from '@app/@pages/dashboard/dashboard.component';
import { StaffComponent } from '@app/@pages/staff/staff.component';
import { SettingsComponent } from '@app/@pages/settings/settings.component';
import { LayoutComponent } from './layout.component';
import { AuthorizedGuard } from '@app/@shared/guards/auth/authorized.guard';

export const routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {path: '', redirectTo: 'business', pathMatch: 'full'},
      {path: 'dashboard', component: DashboardComponent},
      {path: 'account-settings',
        loadChildren: () => import('@app/@pages/account-settings/account-settings.module').then(m => m.AccountSettingsModule)
      },
      {path: 'business', loadChildren: () => import('@app/@pages/business/business.module').then(m => m.BusinessModule)},
      {path: 'catalogs', loadChildren: () => import('@app/@pages/catalogs/catalogs.module').then(m => m.CatalogsModule)},
      {path: 'orders', loadChildren: () => import('@app/@pages/orders/orders.module').then(m => m.OrdersModule)},
      {path: 'inventory', loadChildren: () => import('@app/@pages/inventory/inventory.module').then(m => m.InventoryModule)},
      {path: 'staff', component: StaffComponent},
      {path: 'settings', component: SettingsComponent},
      {path: 'crm', loadChildren: () => import('@app/@pages/crm/crm.module').then(m => m.CrmModule)},
      {path: 'store', loadChildren: () => import('@app/@pages/store/store.module').then(m => m.StoreModule)}
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule
  ]
})
export class RoutesModule {
}
