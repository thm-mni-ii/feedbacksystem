import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
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
  getDatabases(uid: number) {
    return this.http.get<Database[]>(`/api/v2/playground/${uid}/databases`);
  }

  /**
   * Create a new database for a user
   * @param uid User id
   * @param name Name of the database
   * @return The created database, adjusted by the system
   */
  createDatabases(uid: number, name: string) {
    return this.http.put<any>(`/api/v2/playground/${uid}/databases`, {
      name: name,
    });
  }

  // /api/v2/playground/{uid}/databases/{dbId}/activate
  activateDatabase(uid: number, dbId: number) {
    return this.http.post<any>(
      `/api/v2/playground/${uid}/databases/${dbId}/activate`,
      {}
    );
  }
}
