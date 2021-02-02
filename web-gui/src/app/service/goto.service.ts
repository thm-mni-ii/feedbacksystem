import { Injectable } from '@angular/core';
import {Router} from '@angular/router';
import {FeedbackAppService} from './feedback-app.service';

@Injectable({
  providedIn: 'root'
})
export class GoToService {
  private static readonly STORAGE_KEY = 'fbs.goto';

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
    this.router.navigate(['courses', goTo.courseID]);
    return true;
  }

  private getGoTo(): {courseID: number, app: boolean} {
    return JSON.parse(sessionStorage.getItem(GoToService.STORAGE_KEY));
  }
}
