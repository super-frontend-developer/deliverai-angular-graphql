import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ContactsService } from '@app/@core/services/contacts/contacts.service';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent implements OnInit {

  contactId: number;
  contact: any;
  isAddMode: boolean;
  contactForm: FormGroup;
  contactsList: any[];

  constructor(
    public dialogRef: MatDialogRef<ContactFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private contactService: ContactsService
  ) {
    this.isAddMode = data.isAddMode;
    this.contactId = data.id;
    this.contactService.getContacts().subscribe(
			response => {
        this.contactsList = response;
			}
    );

    if (this.contactId) {
      this.contact = this.contactsList.find(item => item.id === this.contactId);
    }
  }

  ngOnInit(): void {
    this.contactForm = new FormGroup({
      id: new FormControl(''),
      first_name: new FormControl('', [Validators.required, Validators.maxLength(10)]),
      last_name: new FormControl('', [Validators.required, Validators.maxLength(30)]),
      email: new FormControl('', [Validators.required, Validators.maxLength(60)]),
      phone_number: new FormControl('', [Validators.required]),
      group: new FormControl('', [Validators.required]),
      source: new FormControl('', [Validators.required]),
    });

    if (this.contact && this.contact !== undefined) {
      for (const key in this.contact) {
        if (this.contact.hasOwnProperty(key)) {
          this.contactForm.controls[`${key}`].setValue(this.contact[key]);
        }
      }
    }
  }

  cancel() {
    this.dialogRef.close();
    this.contactForm.reset();
  }

  save() {
    const index = this.contactsList.findIndex(item => item.id === this.contactId);
    this.contactsList.splice(index, 1, this.contactForm.value);
    this.contactService.setContacts(this.contactsList);
    this.dialogRef.close();
    this.contactForm.reset();
  }

  create () {
    this.contactsList.sort((a,b) => a.id - b.id);
    const newContactId = this.contactsList[this.contactsList.length - 1].id + 1;
    const newContact = {
      id: newContactId,
      first_name: this.contactForm.get('first_name').value,
      last_name: this.contactForm.get('last_name').value,
      phone_number: this.contactForm.get('phone_number').value,
      email: this.contactForm.get('email').value,
      group: this.contactForm.get('group').value,
      source: this.contactForm.get('source').value
    };
    this.contactsList.unshift(newContact);
    this.contactService.setContacts(this.contactsList);
    this.dialogRef.close();
    this.contactForm.reset();
  }
}

