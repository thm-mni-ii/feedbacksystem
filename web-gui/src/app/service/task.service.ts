import { Injectable } from '@angular/core';
import {Observable, of} from "rxjs";
import {Task} from "../model/Task";
import {HttpClient} from "@angular/common/http";
import {Succeeded} from "../model/HttpInterfaces";

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  constructor(private http: HttpClient) { }

  /**
   * Get all tasks of a course
   * @param cid Course id
   * @return Observable that succeeds with all tasks of the course
   */
  getAllTasks(cid: number): Observable<Task[]>{
    return this.http.get<Task[]>(`/api/v1/courses/${cid}/tasks`)
  }

  /**
   * Create a new task
   * @param cid Course id
   * @param task Task state
   * @return The task state adjusted by the server
   */
  createTask(cid: number, task: Task): Observable<Task>{
    return this.http.post<Task>(`/api/v1/courses/${cid}/tasks`, task)
  }

  /**
   * Get a task by id
   * @param cid Course id
   * @param tid Task id
   * @return Observable that succeeds with the task state
   */
  getTask(cid: number, tid: number): Observable<Task>{
    return this.http.get<Task>(`/api/v1/courses/${cid}/tasks/${tid}`)
  }

  /**
   * Update an existing task
   * @param cid Course id
   * @param tid Task id
   * @param task The new task state
   * @return Observable that succeeds if updated successfully
   */
  updateTask(cid: number, tid: number, task: Task): Observable<Succeeded>{
    return this.http.put<Succeeded>(`/api/v1/courses/${cid}/tasks/${tid}`, task)
  }

  /**
   * Delete a task
   * @param cid Course id
   * @param tid Task id
   * @return Observable that succeeds if the task does not exists after this operation.
   */
  deleteTask(cid: number, tid: number): Observable<Succeeded>{
    return this.http.delete<Succeeded>(`/api/v1/courses/${cid}/tasks/${tid}`)
  }

  // PUT /courses/{cid}/tasks/{tid}/main-file
  updateMainFile(cid: number, tid: number, file: String): Observable<any>{
    return of(true) // TODO upload file
  }

  // PUT /courses/{cid}/tasks/{tid}/secondary-file
  updateSecondaryFile(cid: number, tid: number, file: String): Observable<any>{
    return of(true) // TODO upload file
  }
}
