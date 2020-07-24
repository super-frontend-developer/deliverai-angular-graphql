import { NgModule } from '@angular/core';
import { Routes, RouterModule, ActivatedRouteSnapshot, ActivatedRoute } from '@angular/router';
import { NotAuthorizedGuard } from '@app/@shared/guards/auth/not-authorized.guard';
import { AuthorizedGuard } from '@app/@shared/guards/auth/authorized.guard';
import { SidebarComponent } from '@app/@layout/sidebar/sidebar.component';
import { environment } from '@environments/environment';

const routes: Routes = [
  {
    path: 'auth',
    // canActivate: [NotAuthorizedGuard],
    loadChildren: () => import('@app/@pages/auth/auth.module').then(m => m.AuthModule)},
  {
    path: '',
    canActivate: [AuthorizedGuard],
    loadChildren: () => import('@app/@layout/layout.module').then(m => m.LayoutModule)
  },
  {
    path: 'externalRedirect',
    loadChildren: () => import('@app/@layout/layout.module').then(m => m.LayoutModule),
    resolve: {
      url: 'externalUrlProvider'
    }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    {
      provide: 'externalUrlProvider',
      useValue: (route: ActivatedRouteSnapshot, router: ActivatedRoute) => {
        const externalUrl = route.paramMap.get('externalUrl');
        window.open(externalUrl);
      }
    }
  ]
})
export class AppRoutingModule { }
