import { Directive, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';
import { OrderHistory } from '../models/order-history';

export type SortColumn = keyof OrderHistory | '';
export type SortDirection = 'asc' | 'desc' | '';
const rotate: { [key: string]: SortDirection } = { asc: 'desc', desc: '', '': 'asc' };

export interface SortEvent {
  column: SortColumn;
  direction: SortDirection;
}

@Directive({
  selector: '[appSortable]'
})
export class NgbdSortableHeaderDirective {

  @Input() class = '';
  @Input() sortable: SortColumn = '';
  @Input() direction: SortDirection = '';

  @Output() sort = new EventEmitter<SortEvent>();

  @HostBinding('class')
  get hostClasses(): string {
    return [
      this.class,
      this.direction === 'asc' ? 'asc' : this.direction === 'desc' ? 'desc' : '',
    ].join(' ');
  }

  @HostListener('click', [ '$event.target' ])
  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({ column: this.sortable, direction: this.direction });
  }
}
