import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ForgotPasswordComponent } from './forgot-password.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ForgotPasswordComponent
      },
      {
        path: 'success',
        loadChildren: () => import('../email-check/email-check.module')
        .then(m => m.EmailCheckModule),
        data: { animation: 'EmailCheck' }
      },
    ]
  },
]

@NgModule({
  declarations: [ForgotPasswordComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule
  ],
  exports: [
    RouterModule
  ]
})
export class ForgotPasswordModule { }
