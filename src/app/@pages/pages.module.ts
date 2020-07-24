import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/@shared/shared.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StaffComponent } from './staff/staff.component';
import { SettingsComponent } from './settings/settings.component';

@NgModule({
  declarations: [
    DashboardComponent,
    StaffComponent,
    SettingsComponent
  ],
  imports: [
    CommonModule,
    Daterangepicker,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class PagesModule { }
