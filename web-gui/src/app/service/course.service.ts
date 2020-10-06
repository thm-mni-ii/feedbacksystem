import { Injectable } from '@angular/core';
import {USERS} from '../mock-data/mock-users';
import {User} from '../model/User';
import { Observable, of } from 'rxjs';
import {COURSE} from "../mock-data/mock-courses";
import {Course} from "../model/Course";
import {Succeeded} from "../model/HttpInterfaces";

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  constructor() { }

  // GET /courses/
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

  // DELETE /courses/{cid}
  deleteCourse(cid: number): Observable<Succeeded> { // returns an Observable<Succeeded>
    return of();
  }

  //DELETE /users/{uid}/courses/{cid}
  unsubscribeCourse(cid: number, uid: number) {

  }
}
