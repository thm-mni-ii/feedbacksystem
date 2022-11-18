import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Database } from "../model/sql_playground/Database";

@Injectable({
  providedIn: "root",
})
export class SqlPlaygroundService {
  constructor(private http: HttpClient) {}

  /**
   * Load all databases for a user
   * @param uid User id
   */
  getDatabases(uid: number): Observable<Database[]> {
    return this.http.get<Database[]>(`/api/v2/playground/${uid}/databases`);
  }

  /**
   * Create a new database for a user
   * @param uid User id
   * @param name Name of the database
   * @return The created database, adjusted by the system
   */
  createDatabase(uid: number, name: string): Observable<Database> {
    return this.http.post<any>(`/api/v2/playground/${uid}/databases`, {
      name: name,
    });
  }

  /**
   * Delete Database
   * @param uid User id
   * @param name Name of the database
   * @return The deletet database
   */
  deleteDatabase(uid: number, dbId: number) {
    return this.http.delete(`/api/v2/playground/${uid}/databases/${dbId}`);
  }

  // /api/v2/playground/{uid}/databases/{dbId}/activate
  activateDatabase(uid: number, dbId: number): Observable<Database> {
    return this.http.post<any>(
      `/api/v2/playground/${uid}/databases/${dbId}/activate`,
      {}
    );
  }

  // /api/v2/playground/{uid}/databases/{dbId}/execute
  submitStatement(uid: number, dbId: number, statement: string) {
    return this.http.post<any>(
      `/api/v2/playground/${uid}/databases/${dbId}/execute`,
      {
        statement: statement,
      }
    );
  }

  // /api/v2/playground/{uid}/databases/{dbId}/results/{rId}
  getResults(uid: number, dbId: number, rId: number) {
    return this.http.get<any>(
      `/api/v2/playground/${uid}/databases/${dbId}/results/${rId}`
    );
  }

  // /api/v2/playground/{uid}/databases/{dbId}/results
  getResultsList(uid: number, dbId: number): Observable<Database[]> {
    return this.http.get<any>(
      `/api/v2/playground/${uid}/databases/${dbId}/results`
    );
  }
}
