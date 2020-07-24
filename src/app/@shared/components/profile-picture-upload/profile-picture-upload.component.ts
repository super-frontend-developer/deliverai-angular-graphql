import { Component, Input, ElementRef, HostListener, forwardRef } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { UntilDestroy } from '@ngneat/until-destroy';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@UntilDestroy({ arrayName: 'subscriptions' })
@Component({
  selector: 'app-profile-picture-upload',
  templateUrl: './profile-picture-upload.component.html',
  styleUrls: ['./profile-picture-upload.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProfilePictureUploadComponent),
      multi: true
    }
  ]
})
export class ProfilePictureUploadComponent implements ControlValueAccessor {

  private readonly subscriptions = [];

  public uploader: FileUploader;
  hasDragOver = false;

  @Input()
  url = '/assets/images/add_photo.svg';

  public file: File | null = null;

  onChange: (file) => void;

  @HostListener('change', ['$event.target.files']) emitFiles(event: FileList) {
    const file = event && event.item(0);
    this.onChange(file);
    this.file = file;

    // show image preview
    const reader = new FileReader();
    // tslint:disable-next-line:no-shadowed-variable
    reader.onload = (event: any) => {
      this.url = event.target.result;
    }
    reader.readAsDataURL(this.file);
  }

  constructor(private host: ElementRef<HTMLInputElement>) {
  }

  public fileOver(e: any): void {
    this.hasDragOver = e;
  }

  writeValue(value: null) {
    this.host.nativeElement.value = '';
    this.file = null;
  }

  registerOnChange(fn: () => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
  }

}
