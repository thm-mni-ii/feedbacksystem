import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MongoPlaygroundService {
  constructor(private http: HttpClient) {
  }

  createMongoDatabase(userId: number, dbName: string): Observable<any> {
    const body = {
      name: dbName
    };

    return this.http.post(
      `/api/v2/playground/${userId}/databases?dbType=MONGO`,
      body
    );
  }

  deleteMongoDatabase(uid: number, dbId: string): Observable<void> {
    return this.http.delete<void>(`/api/v2/playground/${uid}/databases/mongo/${dbId}`);
  }

  executeMongoQuery(uid: number, dbId: string, query: any): Observable<any> {
    return this.http.post<any>(
      `/api/v2/playground/${uid}/databases/mongo/${dbId}/execute`,
      query
    );
  }

  getMongoDatabases(uid: number): Observable<any> {
    return this.http.get<any>(`/api/v2/playground/${uid}/databases/mongo/list`);
  }

  getMongoCollections(userId: number, dbSuffix: string) {
    return this.http.get<string[]>(`/api/v2/playground/${userId}/databases/mongo/${dbSuffix}/collections`);
  }

  getMongoViews(userId: number, dbSuffix: string) {
    return this.http.get<string[]>(`/api/v2/playground/${userId}/databases/mongo/${dbSuffix}/views`);
  }

  getMongoIndexes(userId: number, dbSuffix: string) {
    return this.http.get<any[]>(`/api/v2/playground/${userId}/databases/mongo/${dbSuffix}/indexes`);
  }
}
