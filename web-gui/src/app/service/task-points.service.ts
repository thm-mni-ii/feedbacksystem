import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {Task} from '../model/Task';
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
      bonusFormula: 'example1'
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
      bonusFormula: 'example2'
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
      bonusFormula: 'example3'
    }
  ];

  constructor(private http: HttpClient) { }

  /**
   * Get all Requirements of a course
   * @param cid Course id
   * @return Observable that succeeds with all requirements of the course
   */
  getAllRequirements(cid: number): Observable<Requirement[]> {
    return of(this.requirements);
  }

  /**
   * Get all Requirements of a course
   * @param cid Course id
   * @param requirement
   * @return Observable that succeeds with all requirements of the course
   */
  createRequirement(cid: number, requirement: Requirement): Observable<Requirement> {
    return of(this.requirements[1]);
  }

  /**
   * Check the bonus Formula
   * @param bonusFormula The formula for bonus points
   * @return Observable that succeeds with the state of the formula // TODO
   */
  checkBonusFormula(bonusFormula: string): Observable<boolean> {
    if (bonusFormula === 'true') {
      return of(true);
    } else {
      return of(false);
    }
  }
}
