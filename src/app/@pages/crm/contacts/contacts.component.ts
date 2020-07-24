import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ContactFormComponent } from '@app/@shared/modal/contact-form/contact-form.component';
import { ContactModel } from '@app/@core/models/contact';
import { ContactsService } from '@app/@core/services/contacts/contacts.service';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})

export class ContactsComponent implements OnInit {

  contactsList: ContactModel[];

  displayedColumns: string[] = ['name', 'phone_number', 'email', 'group', 'source', 'action'];
  dataSource = new MatTableDataSource<ContactModel>([]);

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor(
    public dialog: MatDialog,
    private contactService: ContactsService
  ) {}

  ngOnInit(): void {
    this.contactService.getContacts().subscribe(
			data => {
        this.contactsList = data;
        this.dataSource = new MatTableDataSource<ContactModel>(this.contactsList);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
			}
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  update(contact: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '400px';
    dialogConfig.panelClass = ['custom-modalbox'];
    dialogConfig.data = {
      isAddMode: false,
      id: contact.id
    };
    const dialogRef = this.dialog.open(ContactFormComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  delete(id: number) {
    const index = this.contactsList.findIndex(item => item.id === id);
    this.contactsList.splice(index, 1);
    this.contactService.setContacts(this.contactsList);
  }

  create(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '400px';
    dialogConfig.panelClass = ['custom-modalbox'];
    dialogConfig.data = {
      isAddMode: true,
      id: null
    };
    const dialogRef = this.dialog.open(ContactFormComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
    });
  }

}
