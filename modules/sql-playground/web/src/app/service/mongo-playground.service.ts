import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class MongoPlaygroundService {
  constructor(private http: HttpClient) {}

  createMongoDatabase(userId: number, dbName: string): Observable<any> {
    if (!userId || !dbName) return throwError(() => new Error("Invalid userId or dbName"));
    const body = {
      name: dbName,
    };

    return this.http.post(
      `/api/v2/playground/${userId}/databases?dbType=MONGO`,
      body
    );
  }

  deleteMongoDatabase(userId: number, dbId: string): Observable<void> {
    if (!userId || !dbId) return throwError(() => new Error("Invalid userId or dbId"));
    return this.http.delete<void>(
      `/api/v2/playground/${userId}/databases/mongo/${dbId}`
    );
  }

  executeMongoQuery(userId: number, dbId: string, query: any): Observable<any> {
    if (!userId || !dbId) return throwError(() => new Error("Invalid userId or dbId"));
    return this.http.post<any>(
      `/api/v2/playground/${userId}/databases/mongo/${dbId}/execute`,
      query
    );
  }

  executeMongoShellCommand(
    userId: number,
    dbId: string,
    command: string
  ): Observable<any> {
    if (!userId || !dbId) return throwError(() => new Error("Invalid userId or dbId"));
    return this.http.post<any>(
      `/api/v2/playground/${userId}/databases/mongo/${dbId}/shell-execute`,
      { command }
    );
  }

  createMongoIndex(
    userId: number,
    dbId: string,
    body: { collection: string; index: any }
  ) {
    if (!userId || !dbId) return throwError(() => new Error("Invalid userId or dbId"));
    return this.http.post<{ createdIndex: string }>(
      `/api/v2/playground/${userId}/databases/mongo/${dbId}/create-index`,
      body
    );
  }

  createMongoView(
    userId: number,
    dbId: string,
    body: { viewName: string; collectionSource: string; pipeline: any[] }
  ) {
    if (!userId || !dbId) return throwError(() => new Error("Invalid userId or dbId"));
    return this.http.post<void>(
      `/api/v2/playground/${userId}/databases/mongo/${dbId}/create-view`,
      body
    );
  }

  resetMongoDatabase(userId: number, dbId: string) {
    if (!userId || !dbId) return throwError(() => new Error("Invalid userId or dbId"));
    return this.http.post<{ collections: string[] }>(
      `/api/v2/playground/${userId}/databases/mongo/${dbId}/reset`,
      {}
    );
  }

  getMongoDatabases(userId: number): Observable<any> {
    if (!userId) return throwError(() => new Error("Invalid userId"));
    return this.http.get<any>(
      `/api/v2/playground/${userId}/databases/mongo/list`
    );
  }

  getMongoCollections(userId: number, dbSuffix: string) {
    if (!userId || !dbSuffix) return throwError(() => new Error("Invalid userId or dbSuffix"));
    return this.http.get<string[]>(
      `/api/v2/playground/${userId}/databases/mongo/${dbSuffix}/collections`
    );
  }

  getMongoViews(userId: number, dbSuffix: string) {
    if (!userId || !dbSuffix) return throwError(() => new Error("Invalid userId or dbSuffix"));
    return this.http.get<string[]>(
      `/api/v2/playground/${userId}/databases/mongo/${dbSuffix}/views`
    );
  }

  getMongoIndexes(userId: number, dbSuffix: string) {
    if (!userId || !dbSuffix) return throwError(() => new Error("Invalid userId or dbSuffix"));
    return this.http.get<any[]>(
      `/api/v2/playground/${userId}/databases/mongo/${dbSuffix}/indexes`
    );
  }

  getCollectionCount(userId: number, dbSuffix: string, collection: string) {
    if (!userId || !dbSuffix || !collection) return throwError(() => new Error("Invalid parameters for getCollectionCount"));
    return this.http.get<number>(
      `/api/v2/playground/${userId}/databases/mongo/${dbSuffix}/collections/${collection}/count`
    );
  }
}
