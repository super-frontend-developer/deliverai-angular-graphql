import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ContactModel } from '@app/@core/models/contact';
import { CONTACTS_DATA } from '@app/@shared/data/contacts-data';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {

  private onContacts = new BehaviorSubject<ContactModel[]>([]);

  constructor() {
    this.setContacts(CONTACTS_DATA);
  }

  setContacts(contacts: any[]) {
    this.onContacts.next(contacts);
  }

  getContacts(): Observable<any[]> {
    return this.onContacts.asObservable();
  }
}
