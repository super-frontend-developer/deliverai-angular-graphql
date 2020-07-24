import { Component, OnInit, TemplateRef, AfterViewInit, OnDestroy } from '@angular/core';
import {Apollo} from 'apollo-angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {CdkDragDrop, moveItemInArray, transferArrayItem, copyArrayItem} from '@angular/cdk/drag-drop';
import { Router, ActivatedRoute } from '@angular/router';
import { CatalogDocument } from '@app/@core/graphql/operations/catalog/query.ops.g';
import { CreateCatalogCategoryDocument } from '@app/@core/graphql/operations/catalog/mutation.ops.g';
import { UpdateCatalogCategoryDocument } from '@app/@core/graphql/operations/catalog/mutation.ops.g';
import { CreateCatalogProductDocument } from '@app/@core/graphql/operations/catalog/mutation.ops.g';
import { DeleteCatalogProductDocument } from '@app/@core/graphql/operations/catalog/mutation.ops.g';
import { CreateSharedCatalogModifierDocument } from '@app/@core/graphql/operations/modifiers/mutation.ops.g';
import { CatalogModifierConnectionDocument } from '@app/@core/graphql/operations/modifiers/query.ops.g';
import { CreateCatalogModifierOptionDocument } from '@app/@core/graphql/operations/modifiers/mutation.ops.g';
import { DeleteCatalogModifierOptionDocument } from '@app/@core/graphql/operations/modifiers/mutation.ops.g';
import { LinkCatalogModifierDocument } from '@app/@core/graphql/operations/modifiers/mutation.ops.g';
import { UnlinkCatalogModifierDocument } from '@app/@core/graphql/operations/modifiers/mutation.ops.g';
import { CatalogProductGQL } from '@app/@core/graphql/operations/catalog/query.ops.g';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

declare var $: any;

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, AfterViewInit, OnDestroy {

  private readonly subscriptions = [];

  createCategoryForm: FormGroup;
  createItemForm: FormGroup;
  createModifierForm: FormGroup;
  createModifierItemForm: FormGroup;

  onScrollFn;
  catInView = 0;
  isDetailView = false;
  isModifierView = false;
  isAddModifier = false;
  selectedCategoryItem: any;

  catalogId: any;
  catalog: any;
  modifierList: any[];
  categoryList: any[];

  selectable = true;
  removable = true;

  isCatalogCategoryLoading = false;
  isCatalogProductLoading = false;
  isModifierLoading = false;
  isModifierItemsLoading = false;

  refetch = true;

  public file: File | null = null;
  image = 'assets/images/Item-upload.svg';

  constructor(private activatedRoute: ActivatedRoute,
    private modal: NgbModal,
    public apollo: Apollo,
    private catalogProductGQL: CatalogProductGQL,
    private router: Router) {
      const allParams = this.activatedRoute.snapshot.params;
      if (allParams && allParams.catalogId !== undefined) {
        this.catalogId = allParams.catalogId;
      }
  }

  ngOnInit(): void {
    this.createCategoryForm = new FormGroup({
      categoryName: new FormControl('', [Validators.required])
    });

    this.createItemForm = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('', [Validators.required]),
      price: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required])
    });

    this.createModifierForm = new FormGroup({
      modifierName: new FormControl('', [Validators.required]),
      allowAddingSameChoice: new FormControl(false),
      modifierType: new FormControl('optional', [Validators.required]),
      minimum: new FormControl(''),
      maximum: new FormControl('')
    });

    this.createModifierItemForm = new FormGroup({
      modifierItemName: new FormControl('', [Validators.required]),
      price: new FormControl('', [Validators.required]),
      description: new FormControl(''),
      preSelect: new FormControl('')
    });

    this.catalogDetail();
    this.getCatalogModifierList();
  }

  toggle(category: any) {
    category.node.expanded = !category.node.expanded;
  }

  mobilePreviewToggle() {
    this.isModifierView = !this.isModifierView;
  }

  getCatalogModifierList() {
    this.apollo.watchQuery({
      query: CatalogModifierConnectionDocument,
      variables: {catalog: this.catalogId}
    }).valueChanges.subscribe((response: any) => {
      this.modifierList = response.data.catalogModifierConnection.edges;
      this.modifierList = this.modifierList.map((item) => (
        {
          ...item,
          expanded: false
        }
      ))
    })
  }

  catalogDetail() {
    this.subscriptions.push(
      this.apollo.watchQuery({
        query: CatalogDocument,
        variables: {id: this.catalogId},
        fetchPolicy: this.refetch ? 'network-only' : 'cache-first'
      }).valueChanges.subscribe((result: any) => {
        this.refetch = false;
        this.catalog = result.data.catalog;
        this.categoryList = result.data.catalog.categoryConnection.edges;
      })
    )
  }

  addCategory() {
    this.isCatalogCategoryLoading = true;
    this.refetch = false;
    const formValue = this.createCategoryForm.value;
    this.subscriptions.push(
      this.apollo.mutate({
        mutation: CreateCatalogCategoryDocument,
        variables: {
          catalog: this.catalogId,
          name: formValue.categoryName
        },
        update: (store, {data}) => {
          let existingCatalogData: any;
          let newCatalogCategory: any
          existingCatalogData = store.readQuery({ query: CatalogDocument, variables: {id: this.catalogId} });
          newCatalogCategory = data;
          existingCatalogData.catalog.categoryConnection.edges.push({node: newCatalogCategory.createCatalogCategory, __typename: 'CatalogCategoryConnectionEdge'});
          store.writeQuery({ query: CatalogDocument, variables: {id: this.catalogId}, data: existingCatalogData});
        }
      }).subscribe((response) => {
        this.isCatalogCategoryLoading = false;
        this.createCategoryForm.reset();
      })
    )
  }

  addItem(category: any) {
    category.node.expanded = true;
    category.node.isAddCategoryItem = true;
  }

  createItem(category: any) {
    this.refetch = false;
    this.isCatalogProductLoading = true;
    const formValue = this.createItemForm.value;
    this.subscriptions.push(
      this.apollo.mutate({
        mutation: CreateCatalogProductDocument,
        variables: {
          catalog: this.catalogId,
          category: category.node.id,
          name: formValue.name,
          longContent: formValue.description,
          shortContent: '',
          price: formValue.price,
          image: this.file
        },
        context: {
          useMultipart: true
        },
        update: (store, {data}) => {
          let existingCatalogData: any;
          let newCatalogProduct: any
          existingCatalogData = store.readQuery({ query: CatalogDocument, variables: {id: this.catalogId} });
          newCatalogProduct = data;
          existingCatalogData.catalog.categoryConnection.edges.map((item) => {
            if(item.node.id === category.node.id) {
              item.node.productConnection.edges.push({node: newCatalogProduct.createCatalogProduct, __typename: 'CatalogProductConnectionEdge'});
            }
          });
          store.writeQuery({ query: CatalogDocument, variables: {id: this.catalogId}, data: existingCatalogData});
        }
      }).subscribe(() => {
        this.categoryList.map((item) => {
          if(item.node.id === category.node.id) {
            item.node.expanded = true;
          }
        });
        this.file = null;
        this.isCatalogProductLoading = false;
        this.cancelCreatingItem(category);
      })
    )
  }

  addModifier() {
    this.isAddModifier = true;
  }

  openModifier(modifier: any) {
    modifier.expanded = !modifier.expanded;
    modifier.isAddModifierItem = false;
  }

  addModifierItem(modifier: any) {
    modifier.isAddModifierItem = true;
  }

  editModifierItem(modifierId: any) {

  }

  removeModifierItem(modifierId: any) {
    this.subscriptions.push(
      this.apollo.mutate({
        mutation: DeleteCatalogModifierOptionDocument,
        variables: {
          id: modifierId
        },
        refetchQueries: [{
          query: CatalogModifierConnectionDocument,
          variables: {catalog: this.catalogId}
        }]
      }).subscribe()
    )
  }

  cancelModifier() {
    this.isAddModifier = false;
    this.createModifierForm.reset();
  }

  createModifier() {
    this.isModifierLoading = true;
    const formValue = this.createModifierForm.value;
    this.subscriptions.push(
      this.apollo.mutate({
        mutation: CreateSharedCatalogModifierDocument,
        variables: {
          catalog: this.catalogId,
          name: formValue.modifierName,
          minQuantity: +formValue.minimum,
          maxQuantity: formValue.modifierType === 'optional' ? 20 : +formValue.maximum,
          multiple: formValue.allowAddingSameChoice
        },
        update: (store, {data}) => {
          let existingModifierConnection: any;
          let newCatalogModifier: any
          existingModifierConnection = store.readQuery({ query: CatalogModifierConnectionDocument, variables: {catalog: this.catalogId} });
          newCatalogModifier = data;
          existingModifierConnection.catalogModifierConnection.edges.push({node: newCatalogModifier.createSharedCatalogModifier, __typename: 'CatalogModifierConnectionEdge'});
          store.writeQuery({
            query: CatalogModifierConnectionDocument,
            variables: {catalog: this.catalogId},
            data: existingModifierConnection});
        }
      }).subscribe(() => {
        this.isModifierLoading = false;
        this.cancelModifier();
      })
    )
  }

  createModifierItem(modifier: any) {
    this.isModifierItemsLoading = true;
    const formValue = this.createModifierItemForm.value;
    this.subscriptions.push(
      this.apollo.mutate({
        mutation: CreateCatalogModifierOptionDocument,
        variables: {
          modifier: modifier.node.id,
          name: formValue.modifierItemName,
          description: formValue.description,
          price: formValue.price,
          quantity: formValue.preSelect === true ? 1 : 0
        },
        update: (store, {data}) => {
          let existingModifierConnection: any;
          let newCatalogModifierItem: any
          existingModifierConnection = store.readQuery({ query: CatalogModifierConnectionDocument, variables: {catalog: this.catalogId} });
          newCatalogModifierItem = data;

          existingModifierConnection.catalogModifierConnection.edges.map((item) => {
            if(item.node.id === modifier.node.id) {
              item.node.optionConnection.edges.push({node: newCatalogModifierItem.createCatalogModifierOption, __typename: 'CatalogModifierOptionConnection'});
            }
          });
          store.writeQuery({ query: CatalogModifierConnectionDocument, variables: {id: this.catalogId}, data: existingModifierConnection});
        }
      }).subscribe(() => {
        this.modifierList.map((item) => {
          if(item.node.id === modifier.node.id) {
            item.expanded = true;
          }
        });
        this.isModifierItemsLoading = false;
        this.cancelCreateModifierItem(modifier);
      })
    )
  }

  cancelCreateModifierItem(modifier: any) {
    modifier.isAddModifierItem = false;
    this.createModifierItemForm.reset();
  }

  onFileChange(event) {
    const reader = new FileReader();
    if(event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      this.file = file;
      // tslint:disable-next-line:no-shadowed-variable
      reader.onload = (event: any) => {
        this.image = event.target.result;
      }
      reader.readAsDataURL(this.file);
    }
  }

  cancelCreatingItem(category: any) {
    category.node.isAddCategoryItem = false;
    this.image = 'assets/images/Item-upload.svg';
    this.createItemForm.reset();
  }

  removeItem(deleteConfirm: TemplateRef<any>, item: any, category: any) {
    this.modal.open(deleteConfirm).result.then((result)=>{
      if (result === 'yes') {
        this.subscriptions.push(
          this.apollo.mutate({
            mutation: DeleteCatalogProductDocument,
            variables: {
              product: item.node.id
            },
            refetchQueries: [{
              query: CatalogDocument,
              variables: { id: this.catalogId }
            }]
          }).subscribe()
        )
      }
    });

  }

  viewItemDetail(productId: any) {
    this.isDetailView = true;
    let catalogProduct: any;
    this.subscriptions.push(
      this.catalogProductGQL.watch({ id: productId })
      .valueChanges.subscribe(result => {
        catalogProduct = result.data.catalogProduct;
        if ( catalogProduct.modifierConnection ) {
          for(const modifier of catalogProduct.modifierConnection.edges) {
            for(const modifierItem of modifier.node.optionConnection.edges) {
              if (modifierItem.node.quantity > 0) {
                modifierItem.node.checked = true;
              } else {
                modifierItem.node.checked = false;
              }
            }
          }
        }
        this.selectedCategoryItem = catalogProduct;
      })
    )
  }

  incrementModifierItem(modifierItem: any) {
    modifierItem.node.checked = true;
    modifierItem.node.quantity += 1;
  }

  decrementModifierItem(modifierItem: any) {
    if (modifierItem.node.quantity > 0) {
      modifierItem.node.checked = true;
      modifierItem.node.quantity -= 1;
    } else {
      modifierItem.node.checked = false;
      modifierItem.node.quantity = 0;
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.categoryList, event.previousIndex, event.currentIndex);

    this.subscriptions.push(
      this.apollo.mutate({
        mutation: UpdateCatalogCategoryDocument,
        variables: {
          category: this.categoryList[event.currentIndex].node.id,
          beforeCategory: this.categoryList[event.currentIndex - 1].node.id,
          // afterCategory: this.categoryList[event.currentIndex + 1].node.id
        },
        refetchQueries: [{
          query: CatalogDocument,
          variables: { id: this.catalogId }
        }]
      }).subscribe()
    )
  }

  dropModifier(event: CdkDragDrop<string[]>, productId: any) {
    let droppedModifier: any;
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      copyArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);

      droppedModifier = event.container.data[event.currentIndex];

      this.subscriptions.push(
        this.apollo.mutate({
          mutation: LinkCatalogModifierDocument,
          variables: {
            modifier: droppedModifier.node.id,
            product: productId
          }
        }).subscribe()
      )
    }
  }

  unLinkModifier(modifierId: any, product: any, index: any) {
    product.node.modifierConnection.edges.splice(index, 1);
    this.subscriptions.push(
      this.apollo.mutate({
        mutation: UnlinkCatalogModifierDocument,
        variables: {
          modifier: modifierId,
          product: product.node.id
        }
      }).subscribe()
    )
  }

  previewStore() {
    this.router.navigate(['/externalRedirect',
    {externalUrl: 'https://widget-demo-277814.ew.r.appspot.com/home?catalogId='+this.catalogId+'&storeId='+localStorage.getItem('storeId')}
    // {externalUrl: 'http://localhost:4300/home?catalogId='+this.catalogId+'&storeId='+localStorage.getItem('storeId')}
  ]);
  }

  onScroll() {
    const items = document.querySelectorAll('.category-name');

    let result = 0;

    const categoryListScrollTop = $('#categoryList').scrollTop();
    const categoryListScrollHeight = $('#categoryList').prop('scrollHeight');
    const categoryListInnerHeight = $('#categoryList').innerHeight();

    if (categoryListScrollHeight - categoryListScrollTop <= categoryListInnerHeight + 30) {
      result = items.length - 1;
    } else {
      items.forEach((item, i) => {
        // @ts-ignore
        if (categoryListScrollTop - item.offsetTop + 210 >= 0) result = i;
      });
    }

    if (this.catInView !== result) {
      const catNav = document.querySelector('.categories-nav');
      const cats = document.querySelectorAll('.categories-nav__link');
      // @ts-ignore
      catNav.scroll({left: cats.item(result).offsetLeft-10, top: 0, behavior: 'smooth'});
      this.catInView = result;
    }

  }

  ngAfterViewInit(): void {
    this.onScrollFn = this.onScroll.bind(this);
    document.getElementById('categoryList')
        .addEventListener('scroll', this.onScrollFn);
  }

  ngOnDestroy(): void {
    if (this.onScrollFn && document.getElementById('categoryList') !== null) {
      document.getElementById('categoryList')
        .removeEventListener('scroll', this.onScrollFn);
    }

    for (const sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }

  scrollTo($event, i: number) {
    $event.preventDefault();
    const items = document.querySelectorAll('.category-name');
    // @ts-ignore
    document.getElementById('categoryList').scroll({left: 0, top: items.item(i).offsetTop-170, behavior: 'smooth'});
  }

  back() {
    this.isDetailView = false;
    this.selectedCategoryItem = null;
  }
}
