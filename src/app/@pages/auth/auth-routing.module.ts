import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotAuthorizedGuard } from '@app/@shared/guards/auth/not-authorized.guard';

const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {
    path: 'login',
    canActivate: [NotAuthorizedGuard],
    loadChildren: () => import('./login/login.module')
      .then(m => m.LoginModule),
    data: { animation: 'Login' }
  },
  {
    path: 'registration',
    canActivate: [NotAuthorizedGuard],
    loadChildren: () => import('./register/register.module')
      .then(m => m.RegisterModule),
    data: { animation: 'Registration' }
  },
  {
    path: 'forgot-password',
    canActivate: [NotAuthorizedGuard],
    loadChildren: () => import('./forgot-password/forgot-password.module')
      .then(m => m.ForgotPasswordModule),
    data: { animation: 'Forgot' }
  },
  {
    path: 'reset',
    loadChildren: () => import('./reset-password/reset-password.module')
      .then(m => m.ResetPasswordModule),
    data: { animation: 'Reset' }
  },
  {
    path: 'verify',
    canActivate: [NotAuthorizedGuard],
    loadChildren: () => import('./verify-user/verify-user.module')
      .then(m => m.VerifyUserModule),
    data: { animation: 'Verify' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
