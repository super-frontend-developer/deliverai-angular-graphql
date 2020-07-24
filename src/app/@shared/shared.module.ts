import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GraphqlModule } from '@app/@core/graphql/graphql.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './modules/material.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ChartsModule } from 'ng2-charts';
import { UiSwitchModule } from 'ngx-ui-switch';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FileUploadModule } from 'ng2-file-upload';
import { AutoFocusDirective } from '@app/@core/directives/auto-focus.directive';
import { ProfilePictureUploadComponent } from './components/profile-picture-upload/profile-picture-upload.component';
import { ContactFormComponent } from './modal/contact-form/contact-form.component';
import { ImportItemsModifiersComponent } from './modal/import-items-modifiers/import-items-modifiers.component';
import { OrderDetailComponent } from './modal/order-detail/order-detail.component';
import { StaffFormComponent } from './modal/staff-form/staff-form.component';
import { BusinessStoreDropdownComponent } from './components/business-store-dropdown/business-store-dropdown.component';

@NgModule({
  declarations: [
    ProfilePictureUploadComponent,
    AutoFocusDirective,
    ContactFormComponent,
    ImportItemsModifiersComponent,
    OrderDetailComponent,
    StaffFormComponent,
    BusinessStoreDropdownComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    DragDropModule,
    ChartsModule,
    UiSwitchModule,
    NgbModule,
    FileUploadModule,
    GraphqlModule
  ],
  exports: [
    ProfilePictureUploadComponent,
    BusinessStoreDropdownComponent,
    AutoFocusDirective,
    ContactFormComponent,
    ImportItemsModifiersComponent,
    OrderDetailComponent,
    StaffFormComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    DragDropModule,
    ChartsModule,
    UiSwitchModule,
    NgbModule,
    FileUploadModule,
    GraphqlModule
  ]
})
export class SharedModule {
}
