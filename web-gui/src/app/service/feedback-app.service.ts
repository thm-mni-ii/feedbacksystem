import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FeedbackAppService {
  constructor(private http: HttpClient) { }

  public getToken(): Observable<string> {
    return this.http.post<{token: string}>("/feedbackApp/api/auth/fbs", null)
      .pipe(map((res) => res.token))
  }
}
