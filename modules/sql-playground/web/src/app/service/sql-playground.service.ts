import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { Constraint } from "../model/sql_playground/Constraint";
import { Database } from "../model/sql_playground/Database";
import { Routine } from "../model/sql_playground/Routine";
import { SQLExecuteResponse } from "../model/sql_playground/SQLExecuteResponse";
import {
  SQLPlaygroundShare,
  SQLResponse,
} from "../model/sql_playground/SQLResponse";
import { Table } from "../model/sql_playground/Table";
import { Trigger } from "../model/sql_playground/Trigger";
import { View } from "../model/sql_playground/View";

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
    if (!uid) return throwError(() => new Error("Invalid uid"));
    return this.http.get<Database[]>(`/api/v2/playground/${uid}/databases`);
  }

  /**
   * Create a new database for a user
   * @param uid User id
   * @param name Name of the database
   * @return The created database, adjusted by the system
   */
  createDatabase(uid: number, name: string): Observable<Database> {
    if (!uid) return throwError(() => new Error("Invalid uid"));
    return this.http.post<any>(`/api/v2/playground/${uid}/databases`, {
      name: name,
    });
  }

  /**
   * Delete Database
   * @param uid User id
   * @param dbId Database id
   * @return The deleted database
   */
  deleteDatabase(uid: number, dbId: number) {
    if (!uid || !dbId) return throwError(() => new Error("Invalid uid or dbId"));
    return this.http.delete(`/api/v2/playground/${uid}/databases/${dbId}`);
  }

  /**
   * Activate a database
   * @param uid User id
   * @param dbId Database id
   * @returns Activated database
   */
  activateDatabase(uid: number, dbId: number): Observable<Database> {
    if (!uid || !dbId) return throwError(() => new Error("Invalid uid or dbId"));
    return this.http.post<any>(
      `/api/v2/playground/${uid}/databases/${dbId}/activate`,
      {}
    );
  }

  /**
   * Submit a SQL query
   * @param uid User id
   * @param dbId Database id
   * @param statement SQL statement
   * @returns Execute Response
   */
  submitStatement(
    uid: number,
    dbId: number,
    statement: string
  ): Observable<SQLExecuteResponse> {
    if (!uid || !dbId) return throwError(() => new Error("Invalid uid or dbId"));
    return this.http.post<any>(
      `/api/v2/playground/${uid}/databases/${dbId}/execute`,
      {
        statement: statement,
      }
    );
  }

  /**
   * Get Database Temp URI
   * @return the temporary database URI
   */
  getSharePlaygroundURI(
    uid: number,
    dbId: number
  ): Observable<SQLPlaygroundShare> {
    if (!uid || !dbId) return throwError(() => new Error("Invalid uid or dbId"));
    return this.http.post<any>(
      `/api/v2/playground/${uid}/databases/${dbId}/share`,
      {}
    );
  }

  /**
   * get the result of a query
   * @param uid User id
   * @param dbId Database id
   * @param rId Result id
   * @returns SQL Response
   */
  getResults(uid: number, dbId: number, rId: number): Observable<SQLResponse> {
    if (!uid || !dbId || !rId) return throwError(() => new Error("Invalid parameters for getResults"));
    return this.http.get<any>(
      `/api/v2/playground/${uid}/databases/${dbId}/results/${rId}`
    );
  }

  /**
   * get results of all queries
   * @param uid User id
   * @param dbId Database id
   * @returns all Results
   */
  getResultsList(uid: number, dbId: number): Observable<Database[]> {
    if (!uid || !dbId) return throwError(() => new Error("Invalid uid or dbId"));
    return this.http.get<any>(
      `/api/v2/playground/${uid}/databases/${dbId}/results`
    );
  }

  /**
   * get all tables of a database
   * @param uid User id
   * @param dbId Database id
   * @returns all Tables
   */
  getTables(uid: number, dbId: number): Observable<Table[]> {
    if (!uid || !dbId) return throwError(() => new Error("Invalid uid or dbId"));
    return this.http.get<any>(
      `/api/v2/playground/${uid}/databases/${dbId}/tables`
    );
  }

  /**
   * get all constraints of a database
   * @param uid User id
   * @param dbId Database id
   * @returns all Constraints
   */
  getConstraints(uid: number, dbId: number): Observable<Constraint[]> {
    if (!uid || !dbId) return throwError(() => new Error("Invalid uid or dbId"));
    return this.http.get<any>(
      `/api/v2/playground/${uid}/databases/${dbId}/constraints`
    );
  }

  /**
   * get all views of a database
   * @param uid User id
   * @param dbId Database id
   * @returns all Views
   */
  getViews(uid: number, dbId: number): Observable<View[]> {
    if (!uid || !dbId) return throwError(() => new Error("Invalid uid or dbId"));
    return this.http.get<any>(
      `/api/v2/playground/${uid}/databases/${dbId}/views`
    );
  }

  /**
   * get all triggers of a database
   * @param uid User id
   * @param dbId Database id
   * @returns all Triggers
   */
  getTriggers(uid: number, dbId: number): Observable<Trigger[]> {
    if (!uid || !dbId) return throwError(() => new Error("Invalid uid or dbId"));
    return this.http.get<any>(
      `/api/v2/playground/${uid}/databases/${dbId}/triggers`
    );
  }

  /**
   * get all routines of a database
   * @param uid User id
   * @param dbId Database id
   * @returns all Routines
   */
  getRoutines(uid: number, dbId: number): Observable<Routine[]> {
    if (!uid || !dbId) return throwError(() => new Error("Invalid uid or dbId"));
    return this.http.get<any>(
      `/api/v2/playground/${uid}/databases/${dbId}/routines`
    );
  }

  /**
   * shares a database with a group (updates the share if it all ready exists.
   * @param uid User id
   * @param dbId Database id
   * @param groupId Group id
   * @returns the update database
   */
  shareWithGroup(
    uid: number,
    dbId: number,
    groupId: number
  ): Observable<Database> {
    if (!uid || !dbId || !groupId) return throwError(() => new Error("Invalid parameters for shareWithGroup"));
    return this.http.put<any>(
      `/api/v2/playground/${uid}/databases/${dbId}/share-with-group`,
      { groupId }
    );
  }

  /**
   * unshares a database with a group
   * @param uid User id
   * @param dbId Database id
   * @returns the update database
   */
  unshareWithGroup(uid: number, dbId: number): Observable<Database> {
    if (!uid || !dbId) return throwError(() => new Error("Invalid uid or dbId"));
    return this.http.delete<any>(
      `/api/v2/playground/${uid}/databases/${dbId}/share-with-group`
    );
  }
}
