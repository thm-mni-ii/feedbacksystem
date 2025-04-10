import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MongoPlaygroundService {
  constructor(private http: HttpClient) { }

  executeMongoQuery(uid:number, dbId:string, query:any): Observable<any> {
    return this.http.post<any>(
      `/api/v2/playground/${uid}/databases/mongo/${dbId}/execute`,
      query
    );
  }
}
