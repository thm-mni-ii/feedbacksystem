import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { IntegrationService } from "./integration.service";

@Injectable({
  providedIn: "root",
})
export class FeedbackAppService {
  private static readonly FBA_TOKEN_KEY = "flutter.authToken";
  private static readonly FBA_COURSE_ID_KEY = "flutter.courseId";

  constructor(
    private http: HttpClient,
    private integrationService: IntegrationService
  ) {}

  public getToken(): Observable<string> {
    return this.getBaseUrl().pipe(
      switchMap((baseUrl) => this.getTokenForBaseUrl(baseUrl))
    );
  }

  public open(
    courseID: number | string = null,
    newTab: boolean = false
  ): Observable<void> {
    if (typeof courseID === "number") {
      courseID = courseID.toString();
    }
    return this.getBaseUrl().pipe(
      switchMap((baseUrl) =>
        this.getTokenForBaseUrl(baseUrl).pipe(
          map((token) => {
            localStorage.setItem(
              FeedbackAppService.FBA_TOKEN_KEY,
              JSON.stringify(token)
            );
            if (courseID !== null) {
              localStorage.setItem(
                FeedbackAppService.FBA_COURSE_ID_KEY,
                JSON.stringify(courseID)
              );
            }
            if (newTab) {
              window.open(baseUrl);
            } else {
              window.location.assign(baseUrl);
            }
          })
        )
      )
    );
  }

  private getBaseUrl(): Observable<string> {
    return this.integrationService
      .getIntegration("feedbackApp")
      .pipe(map(({ url }) => (url.endsWith("/") ? url : `${url}/`)));
  }

  private getTokenForBaseUrl(baseUrl: string): Observable<string> {
    return this.http
      .post<{ token: string }>(`${baseUrl}api/auth/fbs`, null)
      .pipe(map((res) => res.token));
  }
}
