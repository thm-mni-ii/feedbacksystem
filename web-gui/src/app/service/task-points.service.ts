import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, of, from, throwError} from 'rxjs';
import {catchError, mergeMap, map, filter, toArray} from 'rxjs/operators';
import {Requirement} from '../model/Requirement';
import {Task} from '../model/Task';

@Injectable({
  providedIn: 'root'
})
export class TaskPointsService {

  requirements: Requirement[] = [
    {
      id: 1,
      toPass: 1,
      tasks: [{
        id: 5,
        name: 'Aufgabe 1',
        description: 'string',
        deadline: 'st'
      }],
      bonusFormula: 'example1',
      hidePoints: false
    },
    {
      id: 2,
      toPass: 2,
      tasks: [{
        id: 2,
        name: 'Aufgabe 2a',
        description: 'string',
        deadline: 'st',
      },
        {
          id: 1,
          name: 'Aufgabe 1a',
          description: 'string',
          deadline: 'st'
        }],
      bonusFormula: 'example2',
      hidePoints: false

    },
    {
      id: 3,
      toPass: 1,
      tasks: [{
        id: 5,
        name: 'Aufgabe 1',
        description: 'string',
        deadline: 'st'
      }],
      bonusFormula: 'example3',
      hidePoints: false
    }
  ];

  constructor(private http: HttpClient) { }

  /**
   * Get all Requirements of a course
   * @param cid Course id
   * @return Observable that succeeds with all requirements of the course
   */
  getAllRequirements(cid: number): Observable<Requirement[]> {
    // return this.http.get<Requirement[]>(`/api/v1/courses/${cid}/evaluation/container`);
    return of(this.requirements);
  }

  /**
   * Get all Requirements of a course
   * @param cid Course id
   * @param requirement
   * @return Observable that succeeds with all requirements of the course
   */
  createRequirement(cid: number, requirement: Requirement): Observable<Requirement> { // TODO: input ändern
    return this.http.post<Requirement>(`/api/v1/courses/${cid}/evaluation/container`, requirement).pipe(
      mergeMap((responseRequirement) => this.setTasks(cid, responseRequirement.id, requirement.tasks).pipe(
        map((tasksResponse) => {
          responseRequirement.tasks = tasksResponse;
          return responseRequirement;
        }),
      )),
    );
    // return of(this.requirements[1]);
  }

  /**
   * Get a requirement of a course by id
   * @param cid Course id
   * @param ctid Id of the criteria/requirement
   * @return Observable that succeeds with the requirement
   */
  getRequirement(cid: number, ctid: number): Observable<Requirement> {
    return this.http.get<Requirement>(`/api/v1/courses/${cid}/evaluation/container/${ctid}`);
  }

  /**
   * Update a requirement
   * @param cid Course id
   * @param ctid Id of the criteria/requirement
   * @param requirement Updated Requirement
   * @return Observable that succeeds with the updated requirement of the course
   */
  updateRequirement(cid: number, ctid: number, requirement: Requirement): Observable<Requirement> { // TODO: input ändern
    return this.http.put<Requirement>(`/api/v1/courses/${cid}/evaluation/container/${ctid}`, requirement).pipe(
      mergeMap((responseRequirement) => this.setTasks(cid, responseRequirement.id, requirement.tasks).pipe(
        map((tasksResponse) => {
          responseRequirement.tasks = tasksResponse;
          return responseRequirement;
        }),
      )),
    );
  }

  /**
   * Delete a requirement of a course by id
   * @param cid Course id
   * @param ctid Id of the criteria/requirement
   * @return Observable that succeeds if the requirement does not exists after the operation
   */
  deleteRequirement(cid: number, ctid: number): Observable<void> {
    return this.http.delete<void>(`/api/v1/courses/${cid}/evaluation/container/${ctid}`);
  }

  /**
   * Sets the tasks to the given state
   * @param cid course id
   * @param requirementID The id of the requirement
   * @param tasks The tasks to be added
   */
  setTasks(cid: number, requirementID: number, tasks: Task[]): Observable<Task[]> {
    return this.getRequirement(cid, requirementID).pipe(
      mergeMap((requirement) => from(requirement.tasks).pipe(
        filter((task) => tasks.find((reqTask) => task.id === reqTask.id) === undefined),
        mergeMap((task) => this.removeTask(cid, requirementID, task.id)),
        toArray(),
      )),
      mergeMap(() => from(tasks).pipe(
        mergeMap((task) => this.addTask(cid, requirementID, task.id)),
        toArray(),
      )),
    );
  }

  /**
   * Add a task to a requirement
   * @param cid Course id
   * @param requirementID The id of the requirement
   * @param taskId The id of the task to be added
   * @return Observable that succeeds with the changed requirement
   */
  addTask(cid: number, requirementID: number, taskId: number): Observable<Task> {
    return this.http.post<Task>(`/api/v1/courses/${cid}/evaluation/container/${requirementID}/task/${taskId}`, {});
  }

  /**
   * Remove a task from a requirement
   * @param cid Course id
   * @param requirementID The id of the requirement
   * @param taskId The id of the task to be removed
   * @return Observable that succeeds with the changed requirement
   */
  removeTask(cid: number, requirementID: number, taskId: number): Observable<Task> {
    return this.http.delete<Task>(`/api/v1/courses/${cid}/evaluation/container/${requirementID}/task/${taskId}`);
  }

  /**
   * Get requirement bý id
   */
  getRquirement(cid: number, ctid: number): Observable<Requirement> {
    // /courses/{cid}/evaluation/container/{ctid}
    return of(this.requirements[1]);
  }

  /**
   * Update requirement bý id
   */
  updateRquirement(cid: number, ctid: number, requirement: Requirement): Observable<Requirement> {
    // /courses/{cid}/evaluation/container/{ctid}
    return of(this.requirements[1]);
  }

  /**
   * Update requirement bý id
   */
  deleteRquirement(cid: number, ctid: number): Observable<any> {
    // /courses/{cid}/evaluation/container/{ctid}
    return of(true);
  }

  /**
   * Check the bonus Formula
   * @param bonusFormula The formula for bonus points
   * @return Observable<string|undefined> that succeeds with the status of the formula
   */
  checkBonusFormula(bonusFormula: string): Observable<{valid: boolean, message: string}> {
    return this.http.post<any>(
      `/api/v1/courses/evaluation/formula/validate`,
      {'formula': bonusFormula}
    ).pipe(
      catchError((err) => {
        if (err instanceof HttpErrorResponse && err.status === 400) {
          return of(err.error);
        }
        return throwError(err);
      }),
    );
    /* if (bonusFormula === 'true') {
       return of(true);
     } else {
       return of(false);
     }*/
  }
}
