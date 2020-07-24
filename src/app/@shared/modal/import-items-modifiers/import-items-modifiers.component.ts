import { Component, OnInit, Inject, ElementRef, HostListener, Input } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-import-items-modifiers',
  templateUrl: './import-items-modifiers.component.html',
  styleUrls: ['./import-items-modifiers.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ImportItemsModifiersComponent,
      multi: true
    }
  ]
})
export class ImportItemsModifiersComponent implements OnInit {

  public file: File | null = null;
  // onChange: Function;

  @HostListener('change', ['$event.target.files']) emitFiles(event: FileList) {
    const file = event && event.item(0);
    // this.onChange(file);
    this.file = file;
  }

  constructor(
    public dialogRef: MatDialogRef<ImportItemsModifiersComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private host: ElementRef<HTMLInputElement>
    ) { }

  ngOnInit(): void {
  }

  cancel() {
    this.dialogRef.close();
  }

  upload() {

  }

  writeValue(value: null) {
    // clear file input
    this.host.nativeElement.value = '';
    this.file = null;
  }


  // registerOnChange(fn: Function) {
  //   this.onChange = fn;
  // }

  // registerOnTouched(fn: Function) {
  // }


}
