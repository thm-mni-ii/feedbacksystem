import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { forkJoin, Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { Integration } from "../model/Integration";

@Injectable({
  providedIn: "root",
})
export class IntegrationService {
  private readonly fallbackIntegrationNames = [
    "modelling",
    "feedbackApp",
    "eat",
    "kanban",
    "sciCheck",
    "questionary",
    "classroom",
  ];

  constructor(private http: HttpClient) {}

  getIntegration(name: string): Observable<Integration> {
    return this.http.get<Integration>("/api/v2/integrations/" + name);
  }

  getAllIntegrations(): Observable<Record<string, Integration>> {
    return this.http
      .get<Record<string, Integration>>("/api/v2/integrations")
      .pipe(catchError(() => this.getAllIntegrationsFallback()));
  }

  private getAllIntegrationsFallback(): Observable<Record<string, Integration>> {
    return forkJoin(
      this.fallbackIntegrationNames.map((name) =>
        this.getIntegration(name).pipe(
          map((integration) => ({ name, integration })),
          catchError(() => of(null))
        )
      )
    ).pipe(
      map((entries) =>
        entries.reduce<Record<string, Integration>>((integrations, entry) => {
          if (entry !== null) {
            integrations[entry.name] = entry.integration;
          }

          return integrations;
        }, {})
      )
    );
  }
}
