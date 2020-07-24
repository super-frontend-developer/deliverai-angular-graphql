import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { StaffModel } from '@app/@core/models/staff';
import { STAFFS_DATA } from '@app/@shared/data/staff-data';

@Injectable({
  providedIn: 'root'
})
export class StaffsService {

  private onStaffs = new BehaviorSubject<StaffModel[]>([]);

  constructor() {
    this.setStaffs(STAFFS_DATA);
  }

  setStaffs(staffs: any[]) {
    this.onStaffs.next(staffs);
  }

  getStaffs(): Observable<any[]> {
    return this.onStaffs.asObservable();
  }
}
