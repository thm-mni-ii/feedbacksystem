import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ParsrService {
  private backendUrl = "/api/v2/parsr";

  constructor(private http: HttpClient) {}

  uploadFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append("file", file);

    return this.http
      .post(`${this.backendUrl}/upload`, formData, { responseType: "text" })
      .pipe(
        map((response) => {
          console.log("Upload Response:", response);
          return response.trim();
        }),
        catchError((error) => {
          console.error("Fehler beim Hochladen:", error);
          return throwError(
            () => new Error("Fehler beim Hochladen der Datei.")
          );
        })
      );
  }

  getText(documentId: string): Observable<any> {
    return this.http.get(`${this.backendUrl}/document/${documentId}/json`).pipe(
      catchError((error) => {
        console.error("Fehler beim Abrufen des Textes:", error);
        return throwError(() => new Error("Fehler beim Abrufen des Textes."));
      })
    );
  }

  getMarkdown(documentId: string): Observable<string> {
    return this.http
      .get<string>(`${this.backendUrl}/document/${documentId}/markdown`, {
        responseType: "text" as "json",
      })
      .pipe(
        catchError((error) => {
          console.error("Fehler beim Abrufen des Markdowns:", error);
          return throwError(
            () => new Error("Fehler beim Abrufen des Markdowns.")
          );
        })
      );
  }

  testConnection(): Observable<string> {
    return this.http.get("/api/v2/parsr/test", { responseType: "text" }).pipe(
      map((response) => {
        console.log("Testverbindung erfolgreich:", response);
        return response;
      }),
      catchError((error) => {
        console.error("Fehler bei der Testverbindung:", error);
        return throwError(() => new Error("Backend nicht erreichbar."));
      })
    );
  }
}
