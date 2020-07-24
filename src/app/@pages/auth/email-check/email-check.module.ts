import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { EmailCheckComponent } from './email-check.component';

const routes: Routes = [
  { path: '', component: EmailCheckComponent }
]

@NgModule({
  declarations: [EmailCheckComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class EmailCheckModule { }
