import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: RegisterComponent
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
  declarations: [RegisterComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class RegisterModule { }
