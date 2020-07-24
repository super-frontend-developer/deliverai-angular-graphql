import { Component, OnInit, ElementRef, HostListener, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CreateCatalogProductGQL } from '@app/@core/graphql/operations/catalog/mutation.ops.g';
import { GetCurrencyListGQL } from '@app/@core/graphql/operations/general/query.ops.g';

@Component({
  selector: 'app-create-item',
  templateUrl: './create-item.component.html',
  styleUrls: ['./create-item.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: CreateItemComponent,
      multi: true
    }
  ]
})
export class CreateItemComponent implements OnInit {

  private readonly subscriptions = [];

  type = 'Item';
  createItemForm: FormGroup;
  currencyList: any[];

  public file: File | null = null;

  @HostListener('change', ['$event.target.files']) emitFiles(event: FileList) {
    const file = event && event.item(0);
    // this.onChange(file);
    this.file = file;
  }

  constructor(private host: ElementRef<HTMLInputElement>,
    private createCatalogProductGQL: CreateCatalogProductGQL,
    private getCurrencyListGQL: GetCurrencyListGQL,
    private router: Router) { }

  ngOnInit(): void {
    this.createItemForm = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('', [Validators.required]),
      price: new FormControl('', [Validators.required]),
      currency: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required])
    });

    this.getCurrencyList();
  }

  cancel() {
    this.router.navigate([ 'catalogs/items-modifiers' ]);
  }

  save() {
    const formValue = this.createItemForm.value;
    this.subscriptions.push(
      this.createCatalogProductGQL
        .mutate({
          catalog: '17',
          name: formValue.name,
          longContent: formValue.description,
          shortContent: '',
          price: formValue.price,
        })
        .subscribe(() => {
          this.router.navigate([ 'catalogs/items-modifiers' ]);
        })
    )
  }

  getCurrencyList() {
    this.subscriptions.push(
      this.getCurrencyListGQL.watch()
      .valueChanges.subscribe(result => {
        this.currencyList = result.data.currencies;
      })
    )
  }

  // writeValue(value: null) {
  //   // clear file input
  //   this.host.nativeElement.value = '';
  //   this.file = null;
  // }

  // registerOnChange(fn: Function) {
  //   this.onChange = fn;
  // }

  // registerOnTouched(fn: Function) {
  // }

}
