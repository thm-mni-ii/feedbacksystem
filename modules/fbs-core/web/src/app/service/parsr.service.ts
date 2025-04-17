import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, throwError, timer } from "rxjs";
import {
  catchError,
  delayWhen,
  filter,
  map,
  retryWhen,
  switchMap,
  take,
  tap,
} from "rxjs/operators";

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
    return timer(0, 2000).pipe(
      switchMap(() => 
        this.http.get<string>(
          `${this.backendUrl}/document/${documentId}/markdown`,
          { responseType: 'text' as 'json' }
        ).pipe(
          catchError(error => {
            // Kein Fehler werfen, sondern als leeres Ergebnis behandeln
            return of(null); 
          })
        )
      ),
      filter(response => !!response), // Filtere leere Antworten
      take(1), // Stoppe nach erstem erfolgreichen Ergebnis
      map(response => response as string)
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
