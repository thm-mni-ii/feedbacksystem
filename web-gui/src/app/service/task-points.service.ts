import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {Requirement} from '../model/Requirement';

@Injectable({
  providedIn: 'root'
})
export class TaskPointsService {

  requirements: Requirement[] = [
    {
      id: 1,
      toPass: 1,
      tasks: [{
        id: 2,
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
        name: 'Aufgabe 2',
        description: 'string',
        deadline: 'st'
      },
        {
          id: 1,
          name: 'Aufgabe 1',
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
        id: 2,
        name: 'Aufgabe 1',
        description: 'string',
        deadline: 'st'
      }],
      bonusFormula: 'example3',
      hidePoints: true
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
  createRequirement(cid: number, requirement: Requirement): Observable<Requirement> {
    // return this.http.post<Requirement>(`/api/v1/courses/${cid}/evaluation/container`, requirement);
    return of(this.requirements[1]);
  }

  /**
   * Get a requirement of a course by id
   * @param cid Course id
   * @param ctid Id of the criteria/requirement
   * @return Observable that succeeds with the requirement
   */
  getRquirement(cid: number, ctid: number): Observable<Requirement> {
    // return this.http.get<Requirement>(`/api/v1/courses/${cid}/evaluation/container/${ctid}`);
    return of(this.requirements[1]);
  }

  /**
   * Update a requirement
   * @param cid Course id
   * @param ctid Id of the criteria/requirement
   * @param requirement Updated Requirement
   * @return Observable that succeeds with the updated requirement of the course
   */
  updateRquirement(cid: number, ctid: number, requirement: Requirement): Observable<Requirement> {
    // return this.http.put<Requirement>(`/api/v1/courses/${cid}/evaluation/container/${ctid}`, requirement);
    return of(this.requirements[1]);
  }

  /**
   * Delete a requirement of a course by id
   * @param cid Course id
   * @param ctid Id of the criteria/requirement
   * @return Observable that succeeds if the requirement does not exists after the operation
   */
  deleteRquirement(cid: number, ctid: number): Observable<void> {
    // return this.http.delete<void>(`/api/v1/courses/${cid}/evaluation/container/${ctid}`);
    return of();
  }

  /**
   * Check the bonus Formula
   * @param bonusFormula The formula for bonus points
   * @return Observable that succeeds with the status of the formula
   */
  checkBonusFormula(bonusFormula: string): Observable<boolean> { // todo: string?
    // return this.http.get<string>(`/api/v1/courses/evaluation/formula/validate`, bonusFormula);
    if (bonusFormula === 'true') {
      return of(true);
    } else {
      return of(false);
    }
  }
}
