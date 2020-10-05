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

  getCourseList(): Observable<Course[]> {
    return of(COURSE)
  }

  // GET /courses/{cid}
  getCourse(cid: number): Observable<Course>{
    return of(COURSE.pop())
  }

  // GET /users/{uid}/courses
  getRegisteredCourses(uid: number): Observable<Course[]>{
    return of(COURSE);
  }
}
