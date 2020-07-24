import { Component, OnInit, Input, OnDestroy, TemplateRef } from '@angular/core';
import {Apollo} from 'apollo-angular';
import { Router, ActivatedRoute } from '@angular/router';
import { CurrentUserBusinessStoreConnectionDocument } from '@app/@core/graphql/operations/business/query.ops.g';
import { DeleteStoreDocument } from '@app/@core/graphql/operations/store/mutation.ops.g';
import { UntilDestroy } from '@ngneat/until-destroy';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@UntilDestroy({ arrayName: 'subscriptions' })
@Component({
  selector: 'app-store-card',
  templateUrl: './store-card.component.html',
  styleUrls: ['./store-card.component.scss']
})
export class StoreCardComponent implements OnInit, OnDestroy {

  private readonly subscriptions = [];

  @Input()
  store: any;

  @Input()
  businessId: any;

  @Input()
  business: any;

  defaultImage = 'assets/images/business-create-logo.svg';

  constructor(private apollo: Apollo,
    private router: Router,
    private modal: NgbModal) { }

  ngOnInit(): void {
  }

  selectStore(store: any) {
    localStorage.setItem('businessId', this.business.id);
    localStorage.setItem('businessName', '');
    localStorage.setItem('storeId', store.node.id);
    localStorage.setItem('storeName', store.node.name);

    const storeIds = [];
    // tslint:disable-next-line:no-shadowed-variable
    for (const store of this.business.storeConnection.edges) {
      storeIds.push(store.node.id);
    }

    localStorage.setItem('storeIds', JSON.stringify(storeIds));

    this.router.navigate([ '/dashboard' ]);
  }

  delete(deleteConfirm: TemplateRef<any>) {
    this.modal.open(deleteConfirm).result.then((result)=>{
      if (result === 'yes') {
        this.subscriptions.push(
          this.apollo.mutate({
            mutation: DeleteStoreDocument,
            variables: {
              id: this.store.node.id
            }
          }).subscribe((resonse) => {
          })
        )
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
