import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Course } from "../model/Course";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class CourseService {
  constructor(private http: HttpClient) {}
  /**
   * @return Observable with all courses
   */
  getCourseList(): Observable<Course[]> {
    return this.http.get<Course[]>("/api/v1/courses");
  }

  /**
   * Get a single course by its id, if it exits
   * @param cid The course id
   */
  getCourse(cid: number): Observable<Course> {
    return this.http.get<Course>(`/api/v1/courses/${cid}`);
  }

  /**
   * Create a new course
   * @param course The course state
   * @return The created course, adjusted by the system
   */
  createCourse(course: Course): Observable<Course> {
    return this.http.post<Course>("/api/v1/courses", course);
  }

  /**
   * Update an existing course
   * @param cid Course id to update
   * @param course The new course state
   */
  updateCourse(cid: number, course: Course): Observable<void> {
    return this.http.put<void>(`/api/v1/courses/${cid}`, course);
  }

  /**
   * Delete a course by its id
   * @param cid The course id
   * @return Observable that succeeds if the course does not exists after the operation
   */
  deleteCourse(cid: number): Observable<void> {
    // returns an Observable<Succeeded>
    return this.http.delete<void>(`/api/v1/courses/${cid}`);
  }

  /**
   * Update only the group selection of a course
   * @param cid Course id
   * @param groupSelection The group selection status to update
   */
  updateGroupSelection(cid: number, groupSelection: boolean): Observable<void> {
    const requestBody = { groupSelection: groupSelection };
    return this.http.put<void>(
      `/api/v1/courses/${cid}/groupSelection`,
      requestBody
    );
  }

  // TODO: export a course as zip format
}
