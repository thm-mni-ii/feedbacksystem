import { Injectable } from '@angular/core';
import {Router} from '@angular/router';
import {FeedbackAppService} from './feedback-app.service';

@Injectable({
  providedIn: 'root'
})
export class GoToService {
  private static readonly STORAGE_KEY = 'fbs.goto';
  private static readonly AUTO_JOIN_KEY = 'fbs.auto_join';

  constructor(private router: Router, private feedbackAppService: FeedbackAppService) { }

  buildLink(courseID: number, app: boolean = false) {
    let link = `${window.location.origin}/go/${courseID}`;
    if (app) {
      link += '/app';
    }
    return link;
  }

  setGoTo(courseID: number, app: boolean = false) {
    sessionStorage.setItem(GoToService.STORAGE_KEY, JSON.stringify({courseID, app}));
  }

  clearGoTo() {
    sessionStorage.removeItem(GoToService.STORAGE_KEY);
  }

  getAndClearAutoJoin(): boolean {
    if (sessionStorage.getItem(GoToService.AUTO_JOIN_KEY) !== 'true') {
      return false;
    }
    sessionStorage.removeItem(GoToService.AUTO_JOIN_KEY);
    return true;
  }

  goTo(): boolean {
    const goTo = this.getGoTo();
    if (goTo === null) {
      return false;
    }
    this.clearGoTo();
    if (goTo.app) {
      this.feedbackAppService.open(goTo.courseID).subscribe(() => {});
      return true;
    }
    this.setAutoJoin();
    this.router.navigate(['courses', goTo.courseID]);
    return true;
  }

  private getGoTo(): {courseID: number, app: boolean} {
    return JSON.parse(sessionStorage.getItem(GoToService.STORAGE_KEY));
  }

  private setAutoJoin() {
    sessionStorage.setItem(GoToService.AUTO_JOIN_KEY, 'true');
  }
}
