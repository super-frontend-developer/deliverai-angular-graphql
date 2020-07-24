import {Component, OnInit, TemplateRef} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modifiers-detail',
  templateUrl: './modifiers-detail.component.html',
  styleUrls: ['./modifiers-detail.component.scss']
})
export class ModifiersDetailComponent implements OnInit {

  constructor(private modal: NgbModal) { }

  ngOnInit(): void {
  }

  addModifierModal(template: TemplateRef<any>) {
    this.modal.open(template);
  }

  addItemModal(template: TemplateRef<any>) {
    this.modal.open(template);
  }

}
