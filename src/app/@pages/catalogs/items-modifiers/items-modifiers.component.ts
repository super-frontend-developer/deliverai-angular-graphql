import {Component, OnInit} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ModifierModel } from '@app/@core/models/modifier';
import { DeleteCatalogProductGQL } from '@app/@core/graphql/operations/catalog/mutation.ops.g';
import { CatalogProductConnectionGQL } from '@app/@core/graphql/operations/catalog/query.ops.g';
import {CdkDragDrop, moveItemInArray, transferArrayItem, copyArrayItem} from '@angular/cdk/drag-drop';
import { InventoryProductConnectionGQL } from '@app/@core/graphql/operations/inventory/query.ops.g';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';

declare var $: any;

@Component({
  selector: 'app-items-modifiers',
  templateUrl: './items-modifiers.component.html',
  styleUrls: ['./items-modifiers.component.scss']
})
export class ItemsModifiersComponent implements OnInit {

  private readonly subscriptions = [];

  type = 'all';
  modifiersList: ModifierModel[];
  filteredModifiersList: ModifierModel[];
  catalogProductList: any[] = [];
  inventoryProductList: any[] = [];

  page = 1;
  pageSize = 5;

  sm = 'd-lg-none';
  lg = 'd-none d-lg-table-cell';

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  fruits: any[] = [
    {name: 'Lemon'},
    {name: 'Lime'},
    {name: 'Apple'},
  ];

  constructor(
    public dialog: MatDialog,
    private catalogProductConnectionGQL: CatalogProductConnectionGQL,
    private deleteCatalogProductGQL: DeleteCatalogProductGQL,
    private inventoryProductConnectionGQL: InventoryProductConnectionGQL,
  ) {}

  ngOnInit(): void {
    // this.modifierService.getModifiers().subscribe(
		// 	data => {
    //     this.modifiersList = data;
    //     if (this.type !== 'all') {
    //       this.filteredModifiersList = this.modifiersList.filter(staff => staff.type === this.type);
    //     } else {
    //       this.filteredModifiersList = this.modifiersList;
    //     }
		// 	}
    // );

    this.getCatalogProductList();
    this.getInventoryProductList();

    $.getScript('./assets/js/customizer.js');
  }

  getCatalogProductList() {
    this.subscriptions.push(
      this.catalogProductConnectionGQL.watch()
      .valueChanges.subscribe(result => {
        this.catalogProductList = result.data.catalogProductConnection.edges;
        this.catalogProductList = this.catalogProductList.map(product => (
          {
          ...product,
          inventoryItems: []
          })
        );
      })
    )
  }

  getInventoryProductList() {
    this.subscriptions.push(
      this.inventoryProductConnectionGQL.watch()
      .valueChanges.subscribe(result => {
        this.inventoryProductList = result.data.inventoryProductConnection.edges;
      })
    )
  }

  search(event: Event) {
    // const filterValue = (event.target as HTMLInputElement).value;
    // this.dataSource.filter = filterValue.trim().toLowerCase();

    // if (this.dataSource.paginator) {
    //   this.dataSource.paginator.firstPage();
    // }
  }

  applyFilter() {
    if (this.type !== 'all') {
      this.filteredModifiersList = this.modifiersList.filter(staff => staff.type === this.type);
    } else {
      this.filteredModifiersList = this.modifiersList;
    }
  }

  delete(id: any) {
    this.subscriptions.push(
      this.deleteCatalogProductGQL
        .mutate({
          product: id,
        })
        .subscribe(result => {
        })
    )
  }

  get modifiers(): any[] {
    return this.filteredModifiersList
      .map((country, i) => ({id: i + 1, ...country}))
      .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      copyArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
    }
  }


  // add(event: MatChipInputEvent): void {
  //   const input = event.input;
  //   const value = event.value;

  //   // Add our fruit
  //   if ((value || '').trim()) {
  //     this.fruits.push({name: value.trim()});
  //   }

  //   // Reset the input value
  //   if (input) {
  //     input.value = '';
  //   }
  // }

  remove(product: any, index: any): void {
    product.inventoryItems.splice(index, 1);
  }
}
