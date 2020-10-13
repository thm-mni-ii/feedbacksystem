import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {Course} from "../model/Course";
import {HttpClient} from "@angular/common/http";
import {Participant} from "../model/Participant";

@Injectable({
  providedIn: 'root'
})
export class CourseRegistrationService {
  constructor(private http: HttpClient) { }

  /**
   * @param uid User id
   * @return All registered courses
   */
  getRegisteredCourses(uid: number): Observable<Course[]>{
    return this.http.get<Course[]>(`/api/v1/users/${uid}/courses`)
  }

  /**
   * @param cid Course id
   * @return All participants of the course
   */
  getCourseParticipants(cid: number): Observable<Participant[]> {
    return this.http.get<Participant[]>(`/api/v1/courses/${cid}/participants`)
  }

  /**
   * Register a user into a course
   * @param uid User id
   * @param cid Course id
   * @param roleName Either, DOCENT, TUTOR, or STUDENT
   * @return Observable that succeeds on successful registration
   */
  registerCourse(uid: number, cid: number, roleName: string = 'STUDENT'): Observable<void> {
    return this.http.put<void>(`/api/v1/users/${uid}/courses/${cid}`, {roleName: roleName})
  }

  /**
   * De-register a user from a course
   * @param cid Course id
   * @param uid User id
   */
  deregisterCourse(cid: number, uid: number): Observable<void>{
    return this.http.delete<void>(`/api/v1/users/${uid}/courses/${cid}`)
  }
}
