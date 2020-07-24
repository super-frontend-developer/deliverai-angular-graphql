import { Component, OnInit, Input, OnDestroy, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {Apollo} from 'apollo-angular';
import { CurrentUserBusinessStoreConnectionDocument } from '@app/@core/graphql/operations/business/query.ops.g';
import { DeleteBusinessDocument } from '@app/@core/graphql/operations/business/mutation.ops.g';
import { UntilDestroy } from '@ngneat/until-destroy';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@UntilDestroy({ arrayName: 'subscriptions' })
@Component({
  selector: 'app-business-card',
  templateUrl: './business-card.component.html',
  styleUrls: ['./business-card.component.scss']
})
export class BusinessCardComponent implements OnInit, OnDestroy {

  private readonly subscriptions = [];

  @Input()
  business: any;

  defaultImage = 'assets/images/business-create-logo.svg';

  constructor(private apollo: Apollo,
    private router: Router,
    private modal: NgbModal) { }

  ngOnInit(): void {
  }

  delete(deleteConfirm: TemplateRef<any>) {
    this.modal.open(deleteConfirm).result.then((result)=>{
      if (result === 'yes') {
        this.subscriptions.push(
          this.apollo.mutate({
            mutation: DeleteBusinessDocument,
            variables: {
              id: this.business.node.business.id,
            },
            refetchQueries: [{
              query: CurrentUserBusinessStoreConnectionDocument,
              variables: {}
            }]
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
