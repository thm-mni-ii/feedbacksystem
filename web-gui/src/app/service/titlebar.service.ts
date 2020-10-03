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

  constructor() {}

  /**
   * Get the last emitted title
   */
  getTitle(): Observable<string> {
    return this.subject.asObservable();
  }

  /**
   * @param title The new title value of the title bar
   */
  emitTitle(title: string) {
    setTimeout(() => { this.subject.next(title); }, 0);
  }
}
