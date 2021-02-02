import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FeedbackAppService {
  private static readonly FBA_TOKEN_KEY = 'flutter.authToken';
  private static readonly FBA_COURSE_ID_KEY = 'flutter.courseId';
  private static readonly FBA_PATH = '/feedbackApp/';

  constructor(private http: HttpClient) { }

  public getToken(): Observable<string> {
    return this.http.post<{token: string}>('/feedbackApp/api/auth/fbs', null)
      .pipe(map((res) => res.token));
  }

  public open(courseID: number | string = null, newTab: boolean = false): Observable<void> {
    if (typeof courseID === 'number') {
      courseID = courseID.toString();
    }
    return this.getToken().pipe(
      map((token) => {
        localStorage.setItem(FeedbackAppService.FBA_TOKEN_KEY, JSON.stringify(token));
        if (courseID !== null) {
          localStorage.setItem(FeedbackAppService.FBA_COURSE_ID_KEY, JSON.stringify(courseID));
        }
        if (newTab) {
          window.open(FeedbackAppService.FBA_PATH);
        } else {
          window.location.pathname = FeedbackAppService.FBA_PATH;
        }
      }),
    );
  }
}
