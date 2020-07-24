import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class TopbarService {

  private visible = new Subject<any>();

  public set topbarVisible(visible: boolean) {
    this.visible.next(visible);
  }

  public get topbarVisible$(): Observable<boolean> {
    return this.visible.asObservable();
  }
}
