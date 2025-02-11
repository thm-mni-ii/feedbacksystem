import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Integration } from "../model/Integration";

@Injectable({
  providedIn: "root",
})
export class IntegrationService {
  constructor(private http: HttpClient) {}

  getIntegration(name: string): Observable<Integration> {
    return this.http.get<Integration>("/api/v2/integrations/" + name);
  }

  getAllIntegrations(): Observable<Record<string, Integration>> {
    return this.http.get<Record<string, Integration>>("/api/v2/integrations");
  }
}
