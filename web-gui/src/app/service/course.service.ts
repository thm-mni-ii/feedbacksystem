import { Injectable } from '@angular/core';
import {USERS} from '../mock-data/mock-users';
import {User} from '../model/User';
import { Observable, of } from 'rxjs';
import {COURSE} from "../mock-data/mock-courses";
import {Course} from "../model/Course";

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  constructor() { }

  // GET /users/{uid}/courses
  getRegisteredCourses(uid: number): Observable<Course[]>{
    return of(COURSE);
  }

  // GET /courses/{cid}/participants --> filter for Role 0
  getDocents(cid: number): Observable<User[]> { // String Array?
    return of(USERS.slice(3,6));
  }

  // GET /courses/{cid}/participants --> filter for User
  getRoleOfUser(uid: number, cid: number): Observable<String>{ // number or String?
    return of("tutor");
  }
}
