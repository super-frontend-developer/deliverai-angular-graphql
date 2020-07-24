import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { VerifyUserComponent } from './verify-user.component';

const routes: Routes = [
  { path: '', component: VerifyUserComponent }
]

@NgModule({
  declarations: [VerifyUserComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule
  ],
  exports: [
    RouterModule
  ]
})
export class VerifyUserModule { }
