import { Injectable } from '@angular/core';
import {Observable, of} from "rxjs";
import {Task} from "../model/Task";
import {Submission} from "../model/Submission";
import {TASKS} from "../mock-data/mock-tasks";
import {SUBMISSION} from "../mock-data/mock-submissions";

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor() { }

  // GET /courses/{cid}/tasks
  getAllTasks(cid: number): Observable<Task[]>{
    return of(TASKS)
  }

  // POST /courses/{cid}/tasks
  createTask(cid: number, task: Task){

  }

  // GET /courses/{cid}/tasks/{tid}
  getTask(cid: number, tid: number): Observable<Task>{
    return of(TASKS.pop())
  }

  // PUT /courses/{cid}/tasks/{tid}
  updateTask(cid: number, tid: number, task: Task){

  }

  // DELETE /courses/{cid}/tasks/{tid}
  deleteTask(cid: number, tid: number){

  }

  // PUT /courses/{cid}/tasks/{tid}/main-file
  updateMainFile(cid: number, tid: number, file: String){

  }

  // PUT /courses/{cid}/tasks/{tid}/secondary-file
  updateSecondaryFile(cid: number, tid: number, file: String){
  }

  // SUBMISSIONS
  // GET /users/{uid}/courses/{cid}/tasks/{tid}/submissions
  getAllSubmissions(uid: number, cid: number, tid: number): Observable<Submission[]>{
    return of(SUBMISSION.slice(1,2))
  }

  // POST /users/{uid}/courses/{cid}/tasks/{tid}/submissions
  submitSolution(uid: number, cid: number, tid: number, solution: any): Observable<Submission>{
    return of(SUBMISSION.pop())
  }

  // PUT /users/{uid}/courses/{cid}/tasks/{tid}/submissions/{sid}
  restartSubmission(uid: number, cid: number, tid: number, sid: number){

  }

  // GET /users/{uid}/courses/{cid}/tasks/{tid}/submissions/{sid}
  getSubmission(uid: number, cid: number, tid: number, sid: number): Observable<Submission>{
    return of(SUBMISSION.pop())
  }

  // PUT /users/{uid}/courses/{cid}/tasks/{tid}/submissions/
  restartAllSubmissions(uid: number, cid: number, tid: number, sid: number){
      //TODO: this Route doesn't exist yet
  }
}
