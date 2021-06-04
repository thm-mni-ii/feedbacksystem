import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {CourseResult} from '../model/CourseResult';
import {EvaluationUserResults} from '../model/EvaluationUserResults';

@Injectable({
  providedIn: 'root'
})
export class CourseResultsService {
  private results = [
    {
      id: 1,
      tasks: {
        task: {
          name: 'task2',
          deadline: '22.02.2021',
          mediaType: 'text',
        },
        attempts: 1,
        passed: true,
      },
      toPass: 2,
      bonusFormula: 0,
      hidePoints: false,
    }
  ];
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
  getRequirementCourseResults(cid: number): Observable<EvaluationUserResults[]> {
    return this.http.get<EvaluationUserResults[]>(`/api/v1/courses/${cid}/evaluation/results`);
  }

  /**
   * @param cid Course id
   * @return All category results
   */
  getRequirementResultData(cid: number): { hidePoints: boolean; toPass: number; bonusFormula: number; id: number;
  tasks: { task: { name: string; mediaType: string; deadline: string }; passed: boolean; attempts: number } }[] {
    return this.results;
  }
}
