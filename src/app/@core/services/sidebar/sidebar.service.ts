import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class SidebarService {

  private visible = new Subject<any>();

  public set sidebarVisible(visible: boolean) {
    this.visible.next(visible);
  }

  public get sidebarVisible$(): Observable<boolean> {
    return this.visible.asObservable();
  }
}
