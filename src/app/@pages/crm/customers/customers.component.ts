import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import { BusinessCustomerConnectionDocument } from '@app/@core/graphql/operations/customer/query.ops.g';
import {Apollo} from 'apollo-angular';
declare var $: any;

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit, OnDestroy {

  private readonly subscriptions = [];

  page = 1;
  pageSize = 5;
  collectionSize = 5;
  customerList: any[] = [];
  businessId: any;
  loadingCustomers: boolean;

  constructor(public apollo: Apollo) {
    this.businessId = localStorage.getItem('businessId');
  }

  ngOnInit(): void {
    $.getScript('./assets/js/customizer.js');
    this.getCustomerList();
  }

  applyFilter(event: Event) {
    // const filterValue = (event.target as HTMLInputElement).value;
    // this.dataSource.filter = filterValue.trim().toLowerCase();

    // if (this.dataSource.paginator) {
    //   this.dataSource.paginator.firstPage();
    // }
  }

  getCustomerList() {
    this.loadingCustomers = true;
    this.subscriptions.push(
      this.apollo.watchQuery({
        query: BusinessCustomerConnectionDocument,
        variables: {
          id: this.businessId
        }
      }).valueChanges.subscribe((response: any) => {
        this.customerList = response.data.business.customerConnection.edges;
        this.customerList = this.customerList.map(item => (
          {
            ...item,
            name: this.getCustomersNames(item.node.names),
            phoneNumber: this.getPhoneNumber(item.node.phoneNumber)
          }
        ))
        this.loadingCustomers = response.loading;
      })
    )
  }

  getCustomersNames(names: string[]) {
    let customersNames = '';
    let i = 0;
    for (const name of names) {
      i++;
      customersNames += name;
      if (i !== names.length) {
        customersNames += ', ';
      }
    }

    return customersNames;
  }

  getPhoneNumber (phoneNumberDetails: any) {
    return ('+' + phoneNumberDetails.countryCode + ' ' + phoneNumberDetails.nationalNumber);
  }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }
}
