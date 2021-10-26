import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {SubTaskStatistic} from '../model/SubTaskStatistic';

@Injectable({
  providedIn: 'root'
})
export class SubtaskStatisticService {

  constructor(private http: HttpClient) {
  }
  /**
   * @param cid course id
   * @return All subtask statistic
   */
  getAllResults(cid: number): Observable<SubTaskStatistic[]> {
    return this.http.get<SubTaskStatistic[]>(`/api/v1/courses/${cid}/statistics/subtasks`);
  }
}
