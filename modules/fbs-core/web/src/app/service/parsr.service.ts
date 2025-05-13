import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, throwError, timer } from "rxjs";
import { catchError, map, switchMap, take } from "rxjs/operators";

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

  getMarkdown(
    documentId: string,
    withImages = false
  ): Observable<string | object> {
    const resource = withImages ? "markdownWithImages" : "markdown";
    return timer(0, 2000).pipe(
      switchMap(() =>
        this.http
          .get<string>(
            `${this.backendUrl}/document/${documentId}/${resource}`,
            {
              responseType: "text" as "json",
            }
          )
          .pipe(
            catchError((_error) => {
              // Kein Fehler werfen, sondern als leeres Ergebnis behandeln
              if (_error?.status === 403) {
                return of({ status: "failed" });
              }
              return of();
            })
          )
      ),
      take(1), // Stoppe nach erstem erfolgreichen Ergebnis
      map((response) => response as string)
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
