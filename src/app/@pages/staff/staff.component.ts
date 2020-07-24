import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { StaffFormComponent } from '@app/@shared/modal/staff-form/staff-form.component';
import { StaffsService } from '@app/@core/services/staffs/staffs.service';
import { BusinessLookupByIdDocument } from '@app/@core/graphql/operations/business/query.ops.g';
import {Apollo} from 'apollo-angular';

@Component({
  selector: 'app-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.scss']
})
export class StaffComponent implements OnInit, OnDestroy {

  private readonly subscriptions = [];

  staffList: any[] = [];

  businessId: any;
  page = 1;
  pageSize = 5;
  selectedRole = 'All';
  loadingStaffs: boolean;

  constructor(
    public dialog: MatDialog,
    private staffService: StaffsService,
    private apollo: Apollo
  ) {
    this.businessId = localStorage.getItem('businessId');
  }

  ngOnInit(): void {
    this.loadingStaffs = true;
    this.subscriptions.push(
      this.apollo.watchQuery({
        query: BusinessLookupByIdDocument,
        variables: {
          id: this.businessId
        }
      }).valueChanges.subscribe((result: any) => {
        this.staffList = result.data.business.assignmentConnection.edges;
        this.loadingStaffs = result.loading;
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
    // if (this.selectedRole !== 'All') {
    //   this.filteredStaffList = this.staffList.filter(staff => staff.role === this.selectedRole);
    // } else {
    //   this.filteredStaffList = this.staffList;
    // }
  }

  create(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '400px';
    dialogConfig.panelClass = ['custom-modalbox'];
    dialogConfig.data = {
      isAddMode: true,
      id: null,
      businessId: this.businessId
    };
    const dialogRef = this.dialog.open(StaffFormComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  edit(staffId: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '400px';
    dialogConfig.panelClass = ['custom-modalbox'];
    dialogConfig.data = {
      isAddMode: false,
      id: staffId,
      businessId: this.businessId
    };
    const dialogRef = this.dialog.open(StaffFormComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  delete(staffId: any) {
    const index = this.staffList.findIndex(item => item.id === staffId);
    this.staffList.splice(index, 1);
    this.staffService.setStaffs(this.staffList);
  }

  // get staffs(): any[] {
  //   return this.filteredStaffList
  //     .map((country, i) => ({id: i + 1, ...country}))
  //     .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);
  // }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }
}
