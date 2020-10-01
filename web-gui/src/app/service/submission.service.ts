import { Injectable } from '@angular/core';
import {Observable, of} from "rxjs";

import {Submission} from "../model/Submission";
import {SUBMISSION} from "../mock-data/mock-submissions";



@Injectable({
  providedIn: 'root'
})
export class SubmissionService {

  constructor() { }

  // GET /users/{uid}/courses/{cid}/tasks/{tid}/submissions
  getAllSubmissions(uid: number, cid: number, tid: number, passed?: boolean): Observable<Submission[]>{
    return of(SUBMISSION)
  }

  // POST /users/{uid}/courses/{cid}/tasks/{tid}/submissions
  submitSubmission(uid: number, cid: number, tid: number, solution: any): Observable<Submission>{ // TODO: any?
    return of(SUBMISSION.pop())
  }

  // PUT /users/{uid}/courses/{cid}/tasks/{tid}/submissions/{sid}
  restartSubmission(uid: number, cid: number, tid: number, sid: number){

  }

  // GET /users/{uid}/courses/{cid}/tasks/{tid}/submissions/{sid}
  getSubmission(uid: number, cid: number, tid: number, sid: number): Observable<Submission>{
    return of(SUBMISSION.pop())
  }
}
