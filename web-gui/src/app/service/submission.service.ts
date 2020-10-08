import { Injectable } from '@angular/core';
import {Observable, of} from "rxjs";
import {Submission} from "../model/Submission";
import {SUBMISSION} from "../mock-data/mock-submissions";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {
  constructor(private http: HttpClient) { }

  /**
   * Load all submission for a task
   * @param uid User id
   * @param cid Course id
   * @param tid Task id
   * @param passed Filters only passed submissions
   * @return Observable that succeeds with all submission of a user for a task
   */
  getAllSubmissions(uid: number, cid: number, tid: number, passed?: boolean): Observable<Submission[]>{
    // TODO: do we need passed filter?
    return this.http.get<Submission[]>(`/api/v1/users/${uid}/courses/${cid}/tasks/${tid}/submissions`)
  }

  /**
   * Restart an already submitted submission. The submission will be checked again
   * @param uid User id
   * @param cid Course id
   * @param tid Task id
   * @param sid submission id
   * @return Observable that succeeds if operation submission was restated
   */
  restartSubmission(uid: number, cid: number, tid: number, sid: number): Observable<void> {
    return this.http.put<void>(`/api/v1/users/${uid}/courses/${cid}/tasks/${tid}/submissions/${sid}`, {})
  }

  /**
   * Load a single submission
   * @param uid User id
   * @param cid Course id
   * @param tid Task id
   * @param sid submission id
   * @return Observable that succeeds with the submission
   */
  getSubmission(uid: number, cid: number, tid: number, sid: number): Observable<void> {
    return this.http.get<void>(`/api/v1/users/${uid}/courses/${cid}/tasks/${tid}/submissions/${sid}`)
  }

  // POST /users/{uid}/courses/{cid}/tasks/{tid}/submissions
  submitSolution(uid: number, cid: number, tid: number, solution: any): Observable<Submission>{
    return of(SUBMISSION.pop()) // TODO: the solution must be a file that we uplaod in body
  }

  // PUT /users/{uid}/courses/{cid}/tasks/{tid}/submissions/
  restartAllSubmissions(uid: number, cid: number, tid: number, sid: number){
    //TODO: this Route doesn't exist yet
  }
}
