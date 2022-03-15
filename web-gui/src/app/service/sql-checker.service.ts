import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {CourseResult} from "../model/CourseResult";


@Injectable({
  providedIn: 'root'
})
export class SqlCheckerService {
  constructor(private http: HttpClient) { }

  getSumUpCorrect(tid: number): Observable<CourseResult[]> {
    return this.http.get<CourseResult[]>(`/api/v1/sqlChecker/${tid}/queries/sumUpCorrect`);
  }
  getSumUpCorrectCombined(tid: number): Observable<CourseResult[]> {
    return this.http.get<CourseResult[]>(`/api/v1/sqlChecker/${tid}/queries/sumUpCorrectCombined`);
  }
  getListByType(tid: number): Observable<CourseResult[]> {
    return this.http.get<CourseResult[]>(`/api/v1/sqlChecker/${tid}/queries/listByType`);
  }
  getListByTypes(tid: number): Observable<CourseResult[]> {
    return this.http.get<CourseResult[]>(`/api/v1/sqlChecker/${tid}/queries/listByTypes`);
  }
}
