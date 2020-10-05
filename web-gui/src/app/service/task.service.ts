import { Injectable } from '@angular/core';
import {Observable, of} from "rxjs";
import {Task} from "../model/Task";
import {TASKS} from "../mock-data/mock-tasks";

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
}
