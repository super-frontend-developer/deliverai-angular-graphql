import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { GetCurrencyListGQL } from '@app/@core/graphql/operations/general/query.ops.g';
import { CreateCatalogDocument } from '@app/@core/graphql/operations/catalog/mutation.ops.g';
import { UpdateCatalogDocument } from '@app/@core/graphql/operations/catalog/mutation.ops.g';
import { DeleteCatalogDocument } from '@app/@core/graphql/operations/catalog/mutation.ops.g';
import { BusinessCatalogConnectionDocument } from '@app/@core/graphql/operations/catalog/query.ops.g';
@Component({
  selector: 'app-catalogs',
  templateUrl: './catalogs.component.html',
  styleUrls: ['./catalogs.component.scss']
})
export class CatalogsComponent implements OnInit, OnDestroy  {

  private readonly subscriptions = [];

  createCatalogForm: FormGroup;
  catalogList: any[] = [];
  currencyList: any[];
  businessId: any;
  storeIds: any[] = [];

  sm = 'd-lg-none';
  lg = 'd-none d-lg-table-cell';

  editMode: string;
  loadingCatalogs: boolean;

  constructor(private modal: NgbModal,
    public apollo: Apollo,
    private getCurrencyListGQL: GetCurrencyListGQL
    ) {
      this.businessId = localStorage.getItem('businessId');
      this.storeIds = localStorage.getItem('storeIds') ? JSON.parse(localStorage.getItem('storeIds')) : [];
    }

  ngOnInit(): void {
    this.loadingCatalogs = true;
    this.createCatalogForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      currency: new FormControl('', [Validators.required])
    });

    this.subscriptions.push(
      this.apollo.watchQuery({
        query: BusinessCatalogConnectionDocument,
        variables: {
          id: this.businessId
        }
      }).valueChanges.subscribe((response: any) => {
        this.catalogList = response.data.business.catalogConnection.edges;
        this.loadingCatalogs = response.loading;
      })
    )

    this.getCurrencyList();
  }

  getCurrencyList() {
    this.subscriptions.push(
      this.getCurrencyListGQL.watch()
      .valueChanges.subscribe(result => {
        this.currencyList = result.data.currencies;
      })
    )
  }

  closeModal() {
    this.modal.dismissAll();
    this.createCatalogForm.reset();
  }

  addMenu(editMenu: TemplateRef<any>, mode, catalog) {
    this.editMode = mode;
    if(catalog !== null) {
      this.createCatalogForm.controls.name.setValue(catalog.node.name);
      this.createCatalogForm.controls.currency.setValue(catalog.node.currency.code);
    }
    this.modal.open(editMenu).result.then((result)=>{
      this.loadingCatalogs = true;
      const formValue = this.createCatalogForm.value;
      if (result === 'add' && this.editMode === 'add') {
        this.subscriptions.push(
          this.apollo.mutate({
            mutation: CreateCatalogDocument,
            variables: {
              business: this.businessId,
              stores: this.storeIds,
              name: formValue.name,
              slug: null,
              currency: formValue.currency
            },
            update: (store, {data}) => {
              let storeBusinessCatalogData: any;
              let mutationData: any;
              mutationData = data;
              storeBusinessCatalogData = store.readQuery({query: BusinessCatalogConnectionDocument, variables: {id: this.businessId}});
              storeBusinessCatalogData.business.catalogConnection.edges.push({node: mutationData.createCatalog})
              store.writeQuery({
                query: BusinessCatalogConnectionDocument,
                variables: {id: this.businessId},
                data: storeBusinessCatalogData});
            }
          }).subscribe(() => {
            this.createCatalogForm.reset();
          })
        )
      } else if (result === 'add' && this.editMode === 'edit') {
        this.subscriptions.push(
          this.apollo.mutate({
            mutation: UpdateCatalogDocument,
            variables: {
              catalog: catalog.node.id,
              stores: this.storeIds,
              name: formValue.name,
              slug: null
            },
            update: (store, {data}) => {
              let storeBusinessCatalogData: any;
              let mutationData: any;
              mutationData = data;
              storeBusinessCatalogData = store.readQuery({query: BusinessCatalogConnectionDocument, variables: {id: this.businessId}});

              var pos = storeBusinessCatalogData.business.catalogConnection.edges.map(function(e) { 
                return e.node.id; 
              }).indexOf(mutationData.updateCatalog.node.id); 
              storeBusinessCatalogData.business.catalogConnection.edges[pos]= {node: mutationData.updateCatalog};
              store.writeQuery({
                query: BusinessCatalogConnectionDocument,
                variables: {id: this.businessId},
                data: storeBusinessCatalogData});
            }
          }).subscribe(() => {
            this.createCatalogForm.reset();
          })
        )
      }
    },
    ()=>{});
  }

  deleteMenu(deleteConfirm: TemplateRef<any>, catalogId) {
    this.modal.open(deleteConfirm).result.then((result)=>{
      if (result === 'yes') {
        this.loadingCatalogs = true;
        this.subscriptions.push(
          this.apollo.mutate({
            mutation: DeleteCatalogDocument,
            variables: {
              catalog: catalogId
            },
            refetchQueries: [{
              query: BusinessCatalogConnectionDocument,
              variables: {
                id: this.businessId
              }
            }]
          }).subscribe(() => {
          })
        );
      }
    });
  }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }
}
