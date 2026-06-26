import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class MongoPlaygroundService {
  constructor(private http: HttpClient) {}

  private buildOptions(courseId?: number) {
    if (courseId == null) {
      return {};
    }

    return {
      params: new HttpParams().set("courseId", courseId.toString()),
    };
  }

  createMongoDatabase(userId: number, dbName: string): Observable<any> {
    const body = {
      name: dbName,
    };

    return this.http.post(
      `/api/v2/playground/${userId}/databases?dbType=MONGO`,
      body
    );
  }

  deleteMongoDatabase(userId: number, dbId: string): Observable<void> {
    return this.http.delete<void>(
      `/api/v2/playground/${userId}/databases/mongo/${dbId}`
    );
  }

  executeMongoQuery(
    userId: number,
    dbId: string,
    query: any,
    courseId?: number
  ): Observable<any> {
    return this.http.post<any>(
      `/api/v2/playground/${userId}/databases/mongo/${dbId}/execute`,
      query,
      this.buildOptions(courseId)
    );
  }

  executeMongoShellCommand(
    userId: number,
    dbId: string,
    command: string,
    courseId?: number
  ): Observable<any> {
    return this.http.post<any>(
      `/api/v2/playground/${userId}/databases/mongo/${dbId}/shell-execute`,
      { command },
      this.buildOptions(courseId)
    );
  }

  createMongoIndex(
    userId: number,
    dbId: string,
    body: { collection: string; index: any }
  ) {
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
    return this.http.post<void>(
      `/api/v2/playground/${userId}/databases/mongo/${dbId}/create-view`,
      body
    );
  }

  resetMongoDatabase(userId: number, dbId: string) {
    return this.http.post<{ collections: string[] }>(
      `/api/v2/playground/${userId}/databases/mongo/${dbId}/reset`,
      {}
    );
  }

  getMongoDatabases(userId: number, courseId?: number): Observable<any> {
    return this.http.get<any>(
      `/api/v2/playground/${userId}/databases/mongo/list`,
      this.buildOptions(courseId)
    );
  }

  getMongoCollections(userId: number, dbSuffix: string, courseId?: number) {
    return this.http.get<string[]>(
      `/api/v2/playground/${userId}/databases/mongo/${dbSuffix}/collections`,
      this.buildOptions(courseId)
    );
  }

  getMongoViews(userId: number, dbSuffix: string, courseId?: number) {
    return this.http.get<string[]>(
      `/api/v2/playground/${userId}/databases/mongo/${dbSuffix}/views`,
      this.buildOptions(courseId)
    );
  }

  getMongoIndexes(userId: number, dbSuffix: string, courseId?: number) {
    return this.http.get<any[]>(
      `/api/v2/playground/${userId}/databases/mongo/${dbSuffix}/indexes`,
      this.buildOptions(courseId)
    );
  }

  getCollectionCount(
    userId: number,
    dbSuffix: string,
    collection: string,
    courseId?: number
  ) {
    return this.http.get<number>(
      `/api/v2/playground/${userId}/databases/mongo/${dbSuffix}/collections/${collection}/count`,
      this.buildOptions(courseId)
    );
  }
}
