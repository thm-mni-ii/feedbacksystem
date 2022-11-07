import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Semester } from "../model/Semester";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class SemesterService {
  constructor(private http: HttpClient) {}

  /**
   * @return Observable with all semester
   */
  getSemesterList(): Observable<Semester[]> {
    return this.http.get<Semester[]>("/api/v1/semester");
  }

  /**
   * Create a new semester
   * @param semester The semester state
   * @return The created semester, adjusted by the system
   */
  createSemester(semester: Semester): Observable<Semester> {
    return this.http.post<Semester>("/api/v1/semester", semester);
  }
}
