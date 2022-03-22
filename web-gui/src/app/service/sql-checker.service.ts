import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {SumUp} from '../model/SumUp';
import {SqlCheckerResult} from '../model/SqlCheckerResult';


@Injectable({
  providedIn: 'root'
})
export class SqlCheckerService {
  constructor(private http: HttpClient) { }

  getSumUpCorrect(tid: number, returns: String): Observable<SumUp[]> {
    return this.http.post<SumUp[]>(`/api/v1/sqlChecker/${tid}/queries/sumUpCorrect`,  {
      returns: returns
    });
  }
  getSumUpCorrectCombined(tid: number, returns: String): Observable<SumUp[]> {
    return this.http.post<SumUp[]>(`/api/v1/sqlChecker/${tid}/queries/sumUpCorrectCombined`, {
      returns: returns
    });
  }
  getListByType(tid: number, returns: String): Observable<SqlCheckerResult[]> {
    return this.http.post<SqlCheckerResult[]>(`/api/v1/sqlChecker/${tid}/queries/listByType`, {
      returns: returns
    });
  }
  getListByTypes(tid: number, tables: Boolean, attributes: Boolean): Observable<SqlCheckerResult[]> {
    return this.http.post<SqlCheckerResult[]>(`/api/v1/sqlChecker/${tid}/queries/listByTypes`, {
      tables: tables,
      attributes: attributes
    });
  }
}
