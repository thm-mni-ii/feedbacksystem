import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {CourseResult} from '../model/CourseResult';
import {RequirementCourseResult} from "../model/RequirementCourseResult";

@Injectable({
  providedIn: 'root'
})
export class CourseResultsService {
  constructor(private http: HttpClient) { }

  /**
   * @param cid User id
   * @return All course results
   */
  getAllResults(cid: number): Observable<CourseResult[]> {
    return this.http.get<CourseResult[]>(`/api/v1/courses/${cid}/results`);
  }

  /**
   * @param cid Course id
   * @return All category results
   */
  getRequirementResults(cid: number): Observable<RequirementCourseResult[]> {
    return this.http.get<RequirementCourseResult[]>(`/api/v1/courses/${cid}/evaluation/results`);
  }
}
