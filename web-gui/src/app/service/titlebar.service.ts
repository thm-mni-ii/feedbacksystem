import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

/**
 * Service to change title in titlebar
 */
@Injectable({
  providedIn: 'root'
})
export class TitlebarService {

  private subject = new Subject<string>();

  constructor() {
  }


  getTitle(): Observable<string> {
    return this.subject.asObservable();
  }


  emitTitle(title: string) {
    this.subject.next(title);
  }


}
